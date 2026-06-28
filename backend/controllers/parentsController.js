const { body, param } = require('express-validator');
const { Op } = require('sequelize');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { getPagination, pagedResponse } = require('../utils/pagination');
const { hashPassword } = require('../services/authService');
const { schoolWhere } = require('../services/tenantService');
const {
  sequelize,
  User,
  Parent,
  Student,
  SchoolClass
} = require('../models');

const parentIncludes = [
  { model: User, as: 'user', attributes: { exclude: ['password'] } },
  {
    model: Student,
    as: 'children',
    through: { attributes: ['relationship', 'isPrimary'] },
    include: [
      { model: User, as: 'user', attributes: { exclude: ['password'] } },
      { model: SchoolClass, as: 'class' }
    ]
  }
];

const createParentValidators = [
  body('firstName').trim().isLength({ min: 2 }),
  body('lastName').trim().isLength({ min: 2 }),
  body('email').isEmail().normalizeEmail(),
  body('password').isStrongPassword({
    minLength: 8,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 1
  })
];

const updateParentValidators = [
  param('id').isInt({ min: 1 }),
  body('email').optional().isEmail().normalizeEmail()
];

const listParents = asyncHandler(async (req, res) => {
  const { page, limit, offset } = getPagination(req.query);
  const where = schoolWhere(req.user);
  const include = [...parentIncludes];

  if (req.query.search) {
    include[0] = {
      ...include[0],
      where: {
        [Op.or]: [
          { firstName: { [Op.like]: `%${req.query.search}%` } },
          { lastName: { [Op.like]: `%${req.query.search}%` } },
          { email: { [Op.like]: `%${req.query.search}%` } }
        ]
      }
    };
  }

  const { rows, count } = await Parent.findAndCountAll({
    where,
    include,
    distinct: true,
    limit,
    offset,
    order: [['createdAt', 'DESC']]
  });

  res.json(pagedResponse(rows, count, page, limit));
});

const getParent = asyncHandler(async (req, res) => {
  const parent = await Parent.findOne({ where: schoolWhere(req.user, { id: req.params.id }), include: parentIncludes });
  if (!parent) throw new ApiError(404, 'Parent not found');
  res.json({ parent });
});

const createParent = asyncHandler(async (req, res) => {
  const parent = await sequelize.transaction(async (transaction) => {
    const user = await User.create({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email.toLowerCase(),
      password: await hashPassword(req.body.password),
      phone: req.body.phone || null,
      role: 'parent',
      schoolId: req.user.schoolId ?? null
    }, { transaction });

    return Parent.create({
      userId: user.id,
      schoolId: req.user.schoolId ?? null,
      occupation: req.body.occupation || null,
      address: req.body.address || null
    }, { transaction });
  });

  const hydrated = await Parent.findOne({ where: schoolWhere(req.user, { id: parent.id }), include: parentIncludes });
  res.status(201).json({ parent: hydrated });
});

const updateParent = asyncHandler(async (req, res) => {
  const parent = await Parent.findOne({ where: schoolWhere(req.user, { id: req.params.id }) });
  if (!parent) throw new ApiError(404, 'Parent not found');

  await sequelize.transaction(async (transaction) => {
    const user = await User.findByPk(parent.userId, { transaction });
    const userUpdate = {};
    ['firstName', 'lastName', 'email', 'phone', 'isActive'].forEach((key) => {
      if (req.body[key] !== undefined) userUpdate[key] = req.body[key];
    });
    if (req.body.password) userUpdate.password = await hashPassword(req.body.password);
    if (Object.keys(userUpdate).length) await user.update(userUpdate, { transaction });

    const profileUpdate = {};
    ['occupation', 'address'].forEach((key) => {
      if (req.body[key] !== undefined) profileUpdate[key] = req.body[key];
    });
    if (Object.keys(profileUpdate).length) await parent.update(profileUpdate, { transaction });
  });

  const hydrated = await Parent.findOne({ where: schoolWhere(req.user, { id: parent.id }), include: parentIncludes });
  res.json({ parent: hydrated });
});

const deleteParent = asyncHandler(async (req, res) => {
  const parent = await Parent.findOne({ where: schoolWhere(req.user, { id: req.params.id }) });
  if (!parent) throw new ApiError(404, 'Parent not found');
  await User.destroy({ where: { id: parent.userId } });
  res.status(204).send();
});

module.exports = {
  createParentValidators,
  updateParentValidators,
  listParents,
  getParent,
  createParent,
  updateParent,
  deleteParent
};
