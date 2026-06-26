const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Teacher = sequelize.define('Teacher', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true
  },
  userId: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
    unique: true
  },
  employeeNumber: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  qualification: {
    type: DataTypes.STRING(120),
    allowNull: true
  },
  specialization: {
    type: DataTypes.STRING(120),
    allowNull: true
  }
}, {
  tableName: 'teachers',
  indexes: [
    { unique: true, fields: ['user_id'] },
    { unique: true, fields: ['employee_number'] }
  ]
});

module.exports = Teacher;
