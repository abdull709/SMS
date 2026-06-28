const { sequelize } = require('../models');
const { runTenantSchemaMigrations } = require('../services/schemaMigrationService');

async function syncDatabase() {
  try {
    await sequelize.authenticate();
    await runTenantSchemaMigrations();
    await sequelize.sync({ alter: true });
    await runTenantSchemaMigrations();
    console.log('Database schema synchronized successfully.');
  } catch (error) {
    console.error('Database sync failed:', error);
    process.exitCode = 1;
  } finally {
    await sequelize.close();
  }
}

syncDatabase();
