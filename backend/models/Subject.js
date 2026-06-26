const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Subject = sequelize.define('Subject', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING(120),
    allowNull: false
  },
  code: {
    type: DataTypes.STRING(30),
    allowNull: false,
    unique: true
  },
  level: {
    type: DataTypes.ENUM('nursery', 'primary', 'secondary', 'all'),
    allowNull: false,
    defaultValue: 'all'
  }
}, {
  tableName: 'subjects',
  indexes: [
    { unique: true, fields: ['code'] },
    { fields: ['level'] }
  ]
});

module.exports = Subject;
