const path = require('path');
const dotenv = require('dotenv');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const sequelize = require('./config/database');
require('./models');

const routes = require('./routes');
const { notFound, errorHandler } = require('./middleware/errorHandler');
const { runTenantSchemaMigrations } = require('./services/schemaMigrationService');

dotenv.config({ path: path.resolve(__dirname, '.env') });

const app = express();
const port = process.env.PORT || 3000;
const databaseStatus = {
  connected: false,
  error: null,
  checkedAt: null
};
function normalizeOrigin(origin) {
  return origin ? origin.trim().replace(/\/+$/, '') : '';
}

const allowedOrigins = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map(normalizeOrigin)
  .filter(Boolean);

app.use(helmet({
  contentSecurityPolicy: false
}));

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(normalizeOrigin(origin))) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));

app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
}

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    app: 'Smart School Manager',
    database: databaseStatus,
    time: new Date().toISOString()
  });
});

app.get('/api', (_req, res) => {
  res.json({
    status: 'ok',
    app: 'Smart School Manager API',
    message: 'Open /login in a browser to sign in, or use /api/auth/login to request a token.'
  });
});

app.use('/api', routes);

const frontendDist = path.resolve(__dirname, '../frontend/dist');
app.use(express.static(frontendDist));
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  return res.sendFile(path.join(frontendDist, 'index.html'), (error) => {
    if (error) next();
  });
});

app.use(notFound);
app.use(errorHandler);

async function connectDatabase() {
  try {
    await sequelize.authenticate();
    if (String(process.env.AUTO_SYNC || 'false').toLowerCase() === 'true') {
      await sequelize.sync({ alter: true });
      await runTenantSchemaMigrations();
    }
    if (String(process.env.AUTO_SEED || 'false').toLowerCase() === 'true') {
      const { seedDatabase } = require('./seeders/seed');
      await seedDatabase({ sync: false });
    }
    databaseStatus.connected = true;
    databaseStatus.error = null;
    databaseStatus.checkedAt = new Date().toISOString();
    console.log('Database connection established.');
  } catch (error) {
    databaseStatus.connected = false;
    databaseStatus.error = error.message;
    databaseStatus.checkedAt = new Date().toISOString();
    console.error('Database connection failed:', error);
  }
}

function start() {
  const server = app.listen(port, () => {
    console.log(`Smart School Manager running on port ${port}`);
    connectDatabase();
  });

  return server;
}

if (require.main === module) {
  start();
}

app.start = start;

module.exports = app;
