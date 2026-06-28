const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Parent = sequelize.define('Parent', {
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
  schoolId: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: true
  },
  occupation: {
    type: DataTypes.STRING(120),
    allowNull: true
  },
  address: {
    type: DataTypes.STRING(255),
    allowNull: true
  }
}, {
  tableName: 'parents',
  indexes: [
    { unique: true, fields: ['user_id'] },
    { fields: ['school_id'] }
  ]
});

module.exports = Parent;
