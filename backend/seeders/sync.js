const { sequelize } = require('../models');

async function syncDatabase() {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ alter: true });
    console.log('Database schema synchronized successfully.');
  } catch (error) {
    console.error('Database sync failed:', error);
    process.exitCode = 1;
  } finally {
    await sequelize.close();
  }
}

syncDatabase();
