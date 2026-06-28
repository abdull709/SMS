const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Student = sequelize.define('Student', {
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
  classId: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false
  },
  admissionNumber: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  dateOfBirth: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  gender: {
    type: DataTypes.ENUM('female', 'male', 'other'),
    allowNull: true
  },
  address: {
    type: DataTypes.STRING(255),
    allowNull: true
  }
}, {
  tableName: 'students',
  indexes: [
    { unique: true, fields: ['user_id'] },
    { unique: true, fields: ['school_id', 'admission_number'] },
    { fields: ['school_id'] },
    { fields: ['class_id'] }
  ]
});

module.exports = Student;
