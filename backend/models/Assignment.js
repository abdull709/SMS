const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Assignment = sequelize.define('Assignment', {
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
    allowNull: false
  },
  schoolId: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: true
  },
  teacherId: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false
  },
  subjectId: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false
  },
  classId: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false
  },
  dueDate: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  totalMarks: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
    defaultValue: 100
  },
  status: {
    type: DataTypes.ENUM('draft', 'published', 'closed'),
    allowNull: false,
    defaultValue: 'published'
  }
}, {
  tableName: 'assignments',
  indexes: [
    { fields: ['school_id'] },
    { fields: ['teacher_id'] },
    { fields: ['class_id', 'due_date'] },
    { fields: ['subject_id'] }
  ]
});

module.exports = Assignment;
