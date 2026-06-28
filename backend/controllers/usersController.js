const { body, param } = require('express-validator');
const { Op } = require('sequelize');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { getPagination, pagedResponse } = require('../utils/pagination');
const { School, User } = require('../models');
const { createUserWithProfile, hashPassword } = require('../services/authService');
const {
  SUPER_ADMIN_EMAIL,
  normalizeEmail,
  requireSuperAdmin
} = require('../services/superAdminService');

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
  requireSuperAdmin(req.user);

  if (req.query.role && req.query.role !== 'admin') {
    throw new ApiError(422, 'This endpoint only manages admin accounts');
  }

  const { page, limit, offset } = getPagination(req.query);
  const where = { role: 'admin' };

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
  requireSuperAdmin(req.user);

  if (req.body.role !== 'admin') {
    throw new ApiError(422, 'This endpoint only creates admin accounts');
  }

  const user = await createUserWithProfile(req.body, { actor: req.user });
  res.status(201).json({ user });
});

const getUser = asyncHandler(async (req, res) => {
  requireSuperAdmin(req.user);

  const user = await User.findOne({
    where: { id: req.params.id, role: 'admin' },
    attributes: { exclude: ['password'] },
    include: schoolInclude
  });
  if (!user) throw new ApiError(404, 'User not found');
  res.json({ user });
});

const updateUser = asyncHandler(async (req, res) => {
  requireSuperAdmin(req.user);

  if (req.body.role && req.body.role !== 'admin') {
    throw new ApiError(422, 'Admin accounts must keep the admin role');
  }

  const user = await User.findOne({ where: { id: req.params.id, role: 'admin' } });
  if (!user) throw new ApiError(404, 'User not found');

  const updatingSelf = Number(user.id) === Number(req.user.id);
  if (updatingSelf && req.body.email !== undefined && normalizeEmail(req.body.email) !== SUPER_ADMIN_EMAIL) {
    throw new ApiError(422, 'The super admin email cannot be changed from this screen');
  }
  if (updatingSelf && req.body.isActive !== undefined && String(req.body.isActive).toLowerCase() === 'false') {
    throw new ApiError(422, 'The super admin account cannot be disabled');
  }

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
  requireSuperAdmin(req.user);

  const user = await User.findOne({ where: { id: req.params.id, role: 'admin' } });
  if (!user) throw new ApiError(404, 'User not found');
  if (Number(user.id) === Number(req.user.id)) {
    throw new ApiError(422, 'The super admin account cannot delete itself');
  }

  await user.destroy();
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
