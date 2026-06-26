const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const StudentParent = sequelize.define('StudentParent', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true
  },
  studentId: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false
  },
  parentId: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false
  },
  relationship: {
    type: DataTypes.STRING(60),
    allowNull: false,
    defaultValue: 'Guardian'
  },
  isPrimary: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  }
}, {
  tableName: 'student_parents',
  indexes: [
    { unique: true, fields: ['student_id', 'parent_id'] },
    { fields: ['student_id'] },
    { fields: ['parent_id'] }
  ]
});

module.exports = StudentParent;
