const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Attendance = sequelize.define('Attendance', {
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
  teacherId: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('present', 'absent', 'late', 'excused'),
    allowNull: false
  },
  remarks: {
    type: DataTypes.STRING(255),
    allowNull: true
  }
}, {
  tableName: 'attendance',
  indexes: [
    { unique: true, fields: ['school_id', 'student_id', 'date'] },
    { fields: ['school_id'] },
    { fields: ['class_id', 'date'] },
    { fields: ['teacher_id'] }
  ]
});

module.exports = Attendance;
