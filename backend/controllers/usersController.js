const { body, param } = require('express-validator');
const { Op } = require('sequelize');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { getPagination, pagedResponse } = require('../utils/pagination');
const { School, User } = require('../models');
const { createUserWithProfile, hashPassword } = require('../services/authService');
const { schoolWhere } = require('../services/tenantService');

const schoolInclude = [{ model: School, as: 'school', attributes: ['id', 'name', 'slug'] }];

const createUserValidators = [
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

const updateUserValidators = [
  param('id').isInt({ min: 1 }),
  body('email').optional().isEmail().normalizeEmail(),
  body('role').optional().isIn(['admin', 'teacher', 'student', 'parent']),
  body('password').optional().isStrongPassword({
    minLength: 8,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 1
  })
];

const listUsers = asyncHandler(async (req, res) => {
  const { page, limit, offset } = getPagination(req.query);
  const where = schoolWhere(req.user);

  if (req.query.role) where.role = req.query.role;
  if (req.query.search) {
    where[Op.or] = [
      { firstName: { [Op.like]: `%${req.query.search}%` } },
      { lastName: { [Op.like]: `%${req.query.search}%` } },
      { email: { [Op.like]: `%${req.query.search}%` } }
    ];
  }

  const { rows, count } = await User.findAndCountAll({
    where,
    attributes: { exclude: ['password'] },
    include: schoolInclude,
    limit,
    offset,
    order: [['createdAt', 'DESC']]
  });

  res.json(pagedResponse(rows, count, page, limit));
});

const createUser = asyncHandler(async (req, res) => {
  const user = await createUserWithProfile(req.body, { actor: req.user });
  res.status(201).json({ user });
});

const getUser = asyncHandler(async (req, res) => {
  const user = await User.findOne({
    where: schoolWhere(req.user, { id: req.params.id }),
    attributes: { exclude: ['password'] },
    include: schoolInclude
  });
  if (!user) throw new ApiError(404, 'User not found');
  res.json({ user });
});

const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findOne({ where: schoolWhere(req.user, { id: req.params.id }) });
  if (!user) throw new ApiError(404, 'User not found');

  const allowed = ['firstName', 'lastName', 'email', 'phone', 'role', 'isActive'];
  const update = {};
  allowed.forEach((key) => {
    if (req.body[key] !== undefined) update[key] = req.body[key];
  });

  if (req.body.password) {
    update.password = await hashPassword(req.body.password);
  }

  await user.update(update);

  const schoolName = String(req.body.schoolName || '').trim();
  if (user.role === 'admin' && schoolName) {
    const school = await School.findByPk(user.schoolId);
    if (school) await school.update({ name: schoolName });
  }

  const updatedUser = await User.findByPk(user.id, {
    attributes: { exclude: ['password'] },
    include: schoolInclude
  });
  res.json({ user: updatedUser });
});

const deleteUser = asyncHandler(async (req, res) => {
  const deleted = await User.destroy({ where: schoolWhere(req.user, { id: req.params.id }) });
  if (!deleted) throw new ApiError(404, 'User not found');
  res.status(204).send();
});

module.exports = {
  createUserValidators,
  updateUserValidators,
  listUsers,
  createUser,
  getUser,
  updateUser,
  deleteUser
};
