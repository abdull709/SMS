const sequelize = require('../config/database');

const tenantTables = [
  'users',
  'classes',
  'subjects',
  'students',
  'parents',
  'teachers',
  'teacher_subjects',
  'student_parents',
  'attendance',
  'grades',
  'assignments',
  'assignment_submissions',
  'announcements',
  'calendar_events',
  'fee_payments',
  'report_cards'
];

function indexColumns(index) {
  return (index.fields || [])
    .map((field) => field.attribute || field.name)
    .filter(Boolean);
}

async function tableExists(tableName) {
  const [rows] = await sequelize.query('SHOW TABLES LIKE ?', {
    replacements: [tableName]
  });
  return rows.length > 0;
}

async function columnExists(tableName, columnName) {
  const [rows] = await sequelize.query(`SHOW COLUMNS FROM \`${tableName}\` LIKE ?`, {
    replacements: [columnName]
  });
  return rows.length > 0;
}

async function ensureColumn(tableName, columnName, definition) {
  if (!await tableExists(tableName)) return;
  if (await columnExists(tableName, columnName)) return;
  await sequelize.query(`ALTER TABLE \`${tableName}\` ADD COLUMN \`${columnName}\` ${definition}`);
}

async function ensureSchoolsTable() {
  await sequelize.query(`
    CREATE TABLE IF NOT EXISTS \`schools\` (
      \`id\` INT UNSIGNED NOT NULL AUTO_INCREMENT,
      \`name\` VARCHAR(160) NOT NULL,
      \`slug\` VARCHAR(180) NOT NULL,
      \`owner_admin_id\` INT UNSIGNED NULL,
      \`created_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      \`updated_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (\`id\`),
      UNIQUE KEY \`schools_slug\` (\`slug\`),
      KEY \`schools_owner_admin_id\` (\`owner_admin_id\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
}

async function ensureTenantColumns() {
  await ensureSchoolsTable();
  await Promise.all(tenantTables.map((tableName) => (
    ensureColumn(tableName, 'school_id', 'INT UNSIGNED NULL')
  )));
}

async function removeUniqueIndex(tableName, columns) {
  if (!await tableExists(tableName)) return;
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
  await ensureTenantColumns();
  await removeUniqueIndex('subjects', ['code']);
  await removeUniqueIndex('students', ['admission_number']);
  await removeUniqueIndex('teachers', ['employee_number']);
}

module.exports = { runTenantSchemaMigrations };
