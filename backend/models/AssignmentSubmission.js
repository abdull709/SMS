const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AssignmentSubmission = sequelize.define('AssignmentSubmission', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true
  },
  assignmentId: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false
  },
  studentId: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'submitted', 'graded'),
    allowNull: false,
    defaultValue: 'pending'
  },
  submittedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  score: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true
  },
  feedback: {
    type: DataTypes.STRING(255),
    allowNull: true
  }
}, {
  tableName: 'assignment_submissions',
  indexes: [
    { unique: true, fields: ['assignment_id', 'student_id'] },
    { fields: ['student_id'] },
    { fields: ['status'] }
  ]
});

module.exports = AssignmentSubmission;
