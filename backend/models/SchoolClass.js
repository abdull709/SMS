const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const SchoolClass = sequelize.define('SchoolClass', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  level: {
    type: DataTypes.ENUM('nursery', 'primary', 'secondary'),
    allowNull: false
  },
  section: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  academicSession: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  classTeacherId: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: true
  }
}, {
  tableName: 'classes',
  indexes: [
    { fields: ['level'] },
    { fields: ['academic_session'] }
  ]
});

module.exports = SchoolClass;
