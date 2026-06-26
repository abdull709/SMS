const { body } = require('express-validator');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { User } = require('../models');
const { createUserWithProfile, login } = require('../services/authService');

const loginValidators = [
  body('email').isEmail().normalizeEmail(),
  body('password').isString().notEmpty()
];

const registerValidators = [
  body('firstName').trim().isLength({ min: 2 }),
  body('lastName').trim().isLength({ min: 2 }),
  body('email').isEmail().normalizeEmail(),
  body('password').isStrongPassword({
    minLength: 8,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 1
  }),
  body('role').isIn(['admin', 'teacher', 'student', 'parent'])
];

const loginUser = asyncHandler(async (req, res) => {
  const result = await login(req.body.email, req.body.password);
  res.json(result);
});

const register = asyncHandler(async (req, res) => {
  const userCount = await User.count();
  const firstUser = userCount === 0;

  if (!firstUser && req.user?.role !== 'admin') {
    throw new ApiError(403, 'Only admins can create users after setup');
  }

  if (firstUser && req.body.role !== 'admin') {
    throw new ApiError(422, 'The first registered user must be an admin');
  }

  const user = await createUserWithProfile(req.body);
  res.status(201).json({ user });
});

const me = asyncHandler(async (req, res) => {
  res.json({ user: req.user });
});

module.exports = {
  loginValidators,
  registerValidators,
  loginUser,
  register,
  me
};
