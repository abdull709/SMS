const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Grade = sequelize.define('Grade', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true
  },
  studentId: {
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
  teacherId: {
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
  assessmentScore: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    defaultValue: 0
  },
  examScore: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    defaultValue: 0
  },
  totalScore: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    defaultValue: 0
  },
  grade: {
    type: DataTypes.STRING(5),
    allowNull: false
  },
  remarks: {
    type: DataTypes.STRING(120),
    allowNull: true
  }
}, {
  tableName: 'grades',
  indexes: [
    { unique: true, fields: ['student_id', 'subject_id', 'term', 'session'] },
    { fields: ['class_id', 'term', 'session'] },
    { fields: ['teacher_id'] }
  ]
});

module.exports = Grade;
