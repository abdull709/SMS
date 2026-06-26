const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const TeacherSubject = sequelize.define('TeacherSubject', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true
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
  }
}, {
  tableName: 'teacher_subjects',
  indexes: [
    { unique: true, fields: ['teacher_id', 'subject_id', 'class_id'] },
    { fields: ['teacher_id'] },
    { fields: ['class_id'] },
    { fields: ['subject_id'] }
  ]
});

module.exports = TeacherSubject;
