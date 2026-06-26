const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const ApiError = require('../utils/ApiError');
const {
  sequelize,
  User,
  Student,
  Parent,
  Teacher
} = require('../models');

const SALT_ROUNDS = 12;

function signToken(user) {
  return jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
  );
}

async function hashPassword(password) {
  return bcrypt.hash(password, SALT_ROUNDS);
}

async function createUserWithProfile(payload) {
  const existing = await User.findOne({ where: { email: payload.email } });
  if (existing) {
    throw new ApiError(409, 'A user with this email already exists');
  }

  return sequelize.transaction(async (transaction) => {
    const user = await User.create({
      firstName: payload.firstName,
      lastName: payload.lastName,
      email: payload.email.toLowerCase(),
      password: await hashPassword(payload.password),
      role: payload.role,
      phone: payload.phone || null,
      isActive: payload.isActive !== undefined ? payload.isActive : true
    }, { transaction });

    const profile = payload.profile || {};

    if (payload.role === 'student') {
      await Student.create({
        userId: user.id,
        classId: profile.classId,
        admissionNumber: profile.admissionNumber,
        dateOfBirth: profile.dateOfBirth || null,
        gender: profile.gender || null,
        address: profile.address || null
      }, { transaction });
    }

    if (payload.role === 'parent') {
      await Parent.create({
        userId: user.id,
        occupation: profile.occupation || null,
        address: profile.address || null
      }, { transaction });
    }

    if (payload.role === 'teacher') {
      await Teacher.create({
        userId: user.id,
        employeeNumber: profile.employeeNumber,
        qualification: profile.qualification || null,
        specialization: profile.specialization || null
      }, { transaction });
    }

    return User.findByPk(user.id, {
      attributes: { exclude: ['password'] },
      transaction
    });
  });
}

async function login(email, password) {
  const user = await User.findOne({ where: { email: email.toLowerCase() } });
  if (!user) {
    throw new ApiError(401, 'Invalid email or password');
  }

  if (!user.isActive) {
    throw new ApiError(403, 'This account has been disabled');
  }

  const passwordMatches = await bcrypt.compare(password, user.password);
  if (!passwordMatches) {
    throw new ApiError(401, 'Invalid email or password');
  }

  await user.update({ lastLoginAt: new Date() });
  return {
    token: signToken(user),
    user: user.toJSON()
  };
}

module.exports = {
  createUserWithProfile,
  hashPassword,
  login,
  signToken
};
