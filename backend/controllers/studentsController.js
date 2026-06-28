const { body, param } = require('express-validator');
const { Op } = require('sequelize');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { getPagination, pagedResponse } = require('../utils/pagination');
const { hashPassword } = require('../services/authService');
const {
  assertCanAccessStudent,
  getAccessibleStudentIds
} = require('../services/accessService');
const { assertSchoolRecord, schoolWhere } = require('../services/tenantService');
const {
  sequelize,
  User,
  Student,
  Parent,
  StudentParent,
  SchoolClass
} = require('../models');

const studentIncludes = [
  { model: User, as: 'user', attributes: { exclude: ['password'] } },
  { model: SchoolClass, as: 'class' },
  {
    model: Parent,
    as: 'parents',
    through: { attributes: ['relationship', 'isPrimary'] },
    include: [{ model: User, as: 'user', attributes: { exclude: ['password'] } }]
  }
];

async function normalizeParentIds(parentIds, user, transaction) {
  if (!Array.isArray(parentIds)) return [];

  const invalidParentIds = parentIds.filter((parentId) => {
    const parsed = Number(parentId);
    return !Number.isInteger(parsed) || parsed < 1;
  });

  if (invalidParentIds.length) {
    throw new ApiError(422, 'Selected parents must be valid parent records.');
  }

  const ids = [...new Set(parentIds.map((parentId) => Number(parentId)))];
  if (!ids.length) return [];

  const existingCount = await Parent.count({
    where: schoolWhere(user, { id: { [Op.in]: ids } }),
    transaction
  });

  if (existingCount !== ids.length) {
    throw new ApiError(422, 'One or more selected parents do not exist. Create the parent record first, then select it for the student.');
  }

  return ids;
}

const createStudentValidators = [
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
  body('classId').isInt({ min: 1 }),
  body('admissionNumber').trim().notEmpty(),
  body('parentIds').optional().isArray(),
  body('parentIds.*').optional().isInt({ min: 1 }).toInt()
];

const updateStudentValidators = [
  param('id').isInt({ min: 1 }),
  body('email').optional().isEmail().normalizeEmail(),
  body('classId').optional().isInt({ min: 1 }),
  body('password').optional().isStrongPassword({
    minLength: 8,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 1
  }),
  body('parentIds').optional().isArray(),
  body('parentIds.*').optional().isInt({ min: 1 }).toInt()
];

const listStudents = asyncHandler(async (req, res) => {
  const { page, limit, offset } = getPagination(req.query);
  const where = schoolWhere(req.user);
  const accessibleIds = await getAccessibleStudentIds(req.user);

  if (accessibleIds) where.id = { [Op.in]: accessibleIds.length ? accessibleIds : [-1] };
  if (req.query.classId) where.classId = req.query.classId;

  const include = [...studentIncludes];
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

  const { rows, count } = await Student.findAndCountAll({
    where,
    include,
    distinct: true,
    limit,
    offset,
    order: [['createdAt', 'DESC']]
  });

  res.json(pagedResponse(rows, count, page, limit));
});

const getStudent = asyncHandler(async (req, res) => {
  await assertCanAccessStudent(req.user, req.params.id);
  const student = await Student.findOne({ where: schoolWhere(req.user, { id: req.params.id }), include: studentIncludes });
  res.json({ student });
});

const createStudent = asyncHandler(async (req, res) => {
  const student = await sequelize.transaction(async (transaction) => {
    await assertSchoolRecord(SchoolClass, req.body.classId, req.user, 'Class', { transaction });
    const parentIds = await normalizeParentIds(req.body.parentIds, req.user, transaction);
    const user = await User.create({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email.toLowerCase(),
      password: await hashPassword(req.body.password),
      role: 'student',
      schoolId: req.user.schoolId ?? null,
      phone: req.body.phone || null
    }, { transaction });

    const created = await Student.create({
      userId: user.id,
      schoolId: req.user.schoolId ?? null,
      classId: req.body.classId,
      admissionNumber: req.body.admissionNumber,
      dateOfBirth: req.body.dateOfBirth || null,
      gender: req.body.gender || null,
      address: req.body.address || null
    }, { transaction });

    if (parentIds.length) {
      await Promise.all(parentIds.map((parentId, index) => StudentParent.findOrCreate({
        where: schoolWhere(req.user, { studentId: created.id, parentId }),
        defaults: {
          schoolId: req.user.schoolId ?? null,
          relationship: req.body.relationship || 'Guardian',
          isPrimary: index === 0
        },
        transaction
      })));
    }

    return created;
  });

  const hydrated = await Student.findOne({ where: schoolWhere(req.user, { id: student.id }), include: studentIncludes });
  res.status(201).json({ student: hydrated });
});

const updateStudent = asyncHandler(async (req, res) => {
  const student = await Student.findOne({ where: schoolWhere(req.user, { id: req.params.id }) });
  if (!student) throw new ApiError(404, 'Student not found');

  await sequelize.transaction(async (transaction) => {
    if (req.body.classId) await assertSchoolRecord(SchoolClass, req.body.classId, req.user, 'Class', { transaction });
    const parentIds = await normalizeParentIds(req.body.parentIds, req.user, transaction);
    const user = await User.findByPk(student.userId, { transaction });
    const userUpdate = {};
    ['firstName', 'lastName', 'email', 'phone', 'isActive'].forEach((key) => {
      if (req.body[key] !== undefined) userUpdate[key] = req.body[key];
    });
    if (req.body.password) userUpdate.password = await hashPassword(req.body.password);
    if (Object.keys(userUpdate).length) await user.update(userUpdate, { transaction });

    const profileUpdate = {};
    ['classId', 'admissionNumber', 'dateOfBirth', 'gender', 'address'].forEach((key) => {
      if (req.body[key] !== undefined) profileUpdate[key] = req.body[key];
    });
    if (Object.keys(profileUpdate).length) await student.update(profileUpdate, { transaction });

    if (Array.isArray(req.body.parentIds)) {
      await StudentParent.destroy({ where: schoolWhere(req.user, { studentId: student.id }), transaction });
      await Promise.all(parentIds.map((parentId, index) => StudentParent.create({
        studentId: student.id,
        schoolId: req.user.schoolId ?? null,
        parentId,
        relationship: req.body.relationship || 'Guardian',
        isPrimary: index === 0
      }, { transaction })));
    }
  });

  const hydrated = await Student.findOne({ where: schoolWhere(req.user, { id: student.id }), include: studentIncludes });
  res.json({ student: hydrated });
});

const deleteStudent = asyncHandler(async (req, res) => {
  const student = await Student.findOne({ where: schoolWhere(req.user, { id: req.params.id }) });
  if (!student) throw new ApiError(404, 'Student not found');
  await User.destroy({ where: { id: student.userId } });
  res.status(204).send();
});

const linkParent = asyncHandler(async (req, res) => {
  const student = await Student.findOne({ where: schoolWhere(req.user, { id: req.params.id }) });
  if (!student) throw new ApiError(404, 'Student not found');

  const parent = await Parent.findOne({ where: schoolWhere(req.user, { id: req.body.parentId }) });
  if (!parent) throw new ApiError(404, 'Parent not found');

  const [link] = await StudentParent.findOrCreate({
    where: schoolWhere(req.user, { studentId: student.id, parentId: parent.id }),
    defaults: {
      schoolId: req.user.schoolId ?? null,
      relationship: req.body.relationship || 'Guardian',
      isPrimary: Boolean(req.body.isPrimary)
    }
  });

  res.status(201).json({ link });
});

module.exports = {
  createStudentValidators,
  updateStudentValidators,
  listStudents,
  getStudent,
  createStudent,
  updateStudent,
  deleteStudent,
  linkParent
};
