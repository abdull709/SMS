const path = require('path');
const dotenv = require('dotenv');
const { Sequelize } = require('sequelize');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const dialect = process.env.DB_DIALECT || (process.env.DATABASE_URL ? 'postgres' : 'mysql');
const defaultSsl = dialect === 'postgres' ? 'true' : 'false';
const useSsl = String(process.env.DB_SSL || defaultSsl).toLowerCase() === 'true';

const commonOptions = {
  dialect,
  logging: false,
  define: {
    underscored: true,
    timestamps: true
  },
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  dialectOptions: useSsl ? { ssl: { require: true, rejectUnauthorized: false } } : {}
};

const sequelize = process.env.DATABASE_URL
  ? new Sequelize(process.env.DATABASE_URL, commonOptions)
  : new Sequelize(
    process.env.DB_NAME || 'smart_school_manager',
    process.env.DB_USER || 'root',
    process.env.DB_PASSWORD || '',
    {
      ...commonOptions,
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT || (dialect === 'postgres' ? 5432 : 3306))
    }
  );

module.exports = sequelize;
