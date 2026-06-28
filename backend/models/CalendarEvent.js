const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const CalendarEvent = sequelize.define('CalendarEvent', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true
  },
  title: {
    type: DataTypes.STRING(160),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  startDate: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  endDate: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  type: {
    type: DataTypes.ENUM('academic', 'holiday', 'exam', 'meeting', 'event'),
    allowNull: false,
    defaultValue: 'event'
  },
  schoolId: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: true
  },
  createdBy: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false
  },
  visibleTo: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: ['all']
  }
}, {
  tableName: 'calendar_events',
  indexes: [
    { fields: ['school_id'] },
    { fields: ['start_date'] },
    { fields: ['created_by'] }
  ]
});

module.exports = CalendarEvent;
