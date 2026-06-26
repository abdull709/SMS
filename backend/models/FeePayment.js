const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const FeePayment = sequelize.define('FeePayment', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true
  },
  studentId: {
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
  amountDue: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    defaultValue: 0
  },
  amountPaid: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    defaultValue: 0
  },
  dueDate: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('unpaid', 'partial', 'paid'),
    allowNull: false,
    defaultValue: 'unpaid'
  }
}, {
  tableName: 'fee_payments',
  indexes: [
    { fields: ['student_id', 'term', 'session'] },
    { fields: ['status'] }
  ]
});

module.exports = FeePayment;
