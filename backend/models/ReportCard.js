const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ReportCard = sequelize.define('ReportCard', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true
  },
  studentId: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false
  },
  schoolId: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: true
  },
  classId: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false
  },
  term: {
    type: DataTypes.ENUM('First Term', 'Second Term', 'Third Term'),
    allowNull: false
  },
  session: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  averageScore: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    defaultValue: 0
  },
  remarks: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  generatedBy: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: true
  }
}, {
  tableName: 'report_cards',
  indexes: [
    { unique: true, fields: ['school_id', 'student_id', 'term', 'session'] },
    { fields: ['school_id'] },
    { fields: ['class_id'] }
  ]
});

module.exports = ReportCard;
