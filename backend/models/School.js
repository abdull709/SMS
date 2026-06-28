const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const School = sequelize.define('School', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING(160),
    allowNull: false
  },
  slug: {
    type: DataTypes.STRING(180),
    allowNull: false,
    unique: true
  },
  ownerAdminId: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: true
  }
}, {
  tableName: 'schools',
  indexes: [
    { unique: true, fields: ['slug'] },
    { fields: ['owner_admin_id'] }
  ]
});

module.exports = School;
