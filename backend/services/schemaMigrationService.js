const sequelize = require('../config/database');

function indexColumns(index) {
  return (index.fields || [])
    .map((field) => field.attribute || field.name)
    .filter(Boolean);
}

async function removeUniqueIndex(tableName, columns) {
  const queryInterface = sequelize.getQueryInterface();
  const indexes = await queryInterface.showIndex(tableName);
  const index = indexes.find((candidate) => (
    candidate.unique
    && indexColumns(candidate).join(',') === columns.join(',')
  ));

  if (index) {
    await queryInterface.removeIndex(tableName, index.name);
  }
}

async function runTenantSchemaMigrations() {
  await removeUniqueIndex('subjects', ['code']);
  await removeUniqueIndex('students', ['admission_number']);
  await removeUniqueIndex('teachers', ['employee_number']);
}

module.exports = { runTenantSchemaMigrations };
