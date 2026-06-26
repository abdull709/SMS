const { body, param } = require('express-validator');
const { Op } = require('sequelize');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { getPagination, pagedResponse } = require('../utils/pagination');
const { hashPassword } = require('../services/authService');
const {
  sequelize,
  User,
  Teacher,
  Subject,
  SchoolClass,
  TeacherSubject
} = require('../models');

const teacherIncludes = [
  { model: User, as: 'user', attributes: { exclude: ['password'] } },
  {
    model: Subject,
    as: 'subjects',
    through: { attributes: ['classId'] }
  },
  {
    model: SchoolClass,
    as: 'classes',
    through: { attributes: ['subjectId'] }
  }
];

const createTeacherValidators = [
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
  body('employeeNumber').trim().notEmpty()
];

const updateTeacherValidators = [
  param('id').isInt({ min: 1 }),
  body('email').optional().isEmail().normalizeEmail()
];

const listTeachers = asyncHandler(async (req, res) => {
  const { page, limit, offset } = getPagination(req.query);
  const where = {};
  const include = [...teacherIncludes];

  if (req.user.role === 'teacher') {
    where.userId = req.user.id;
  }

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

  const { rows, count } = await Teacher.findAndCountAll({
    where,
    include,
    distinct: true,
    limit,
    offset,
    order: [['createdAt', 'DESC']]
  });

  res.json(pagedResponse(rows, count, page, limit));
});

const getTeacher = asyncHandler(async (req, res) => {
  const teacher = await Teacher.findByPk(req.params.id, { include: teacherIncludes });
  if (!teacher) throw new ApiError(404, 'Teacher not found');
  if (req.user.role === 'teacher' && teacher.userId !== req.user.id) {
    throw new ApiError(403, 'You cannot access another teacher profile');
  }
  res.json({ teacher });
});

const createTeacher = asyncHandler(async (req, res) => {
  const teacher = await sequelize.transaction(async (transaction) => {
    const user = await User.create({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email.toLowerCase(),
      password: await hashPassword(req.body.password),
      phone: req.body.phone || null,
      role: 'teacher'
    }, { transaction });

    return Teacher.create({
      userId: user.id,
      employeeNumber: req.body.employeeNumber,
      qualification: req.body.qualification || null,
      specialization: req.body.specialization || null
    }, { transaction });
  });

  const hydrated = await Teacher.findByPk(teacher.id, { include: teacherIncludes });
  res.status(201).json({ teacher: hydrated });
});

const updateTeacher = asyncHandler(async (req, res) => {
  const teacher = await Teacher.findByPk(req.params.id);
  if (!teacher) throw new ApiError(404, 'Teacher not found');

  await sequelize.transaction(async (transaction) => {
    const user = await User.findByPk(teacher.userId, { transaction });
    const userUpdate = {};
    ['firstName', 'lastName', 'email', 'phone', 'isActive'].forEach((key) => {
      if (req.body[key] !== undefined) userUpdate[key] = req.body[key];
    });
    if (req.body.password) userUpdate.password = await hashPassword(req.body.password);
    if (Object.keys(userUpdate).length) await user.update(userUpdate, { transaction });

    const profileUpdate = {};
    ['employeeNumber', 'qualification', 'specialization'].forEach((key) => {
      if (req.body[key] !== undefined) profileUpdate[key] = req.body[key];
    });
    if (Object.keys(profileUpdate).length) await teacher.update(profileUpdate, { transaction });
  });

  const hydrated = await Teacher.findByPk(teacher.id, { include: teacherIncludes });
  res.json({ teacher: hydrated });
});

const deleteTeacher = asyncHandler(async (req, res) => {
  const teacher = await Teacher.findByPk(req.params.id);
  if (!teacher) throw new ApiError(404, 'Teacher not found');
  await User.destroy({ where: { id: teacher.userId } });
  res.status(204).send();
});

const assignTeacher = asyncHandler(async (req, res) => {
  const teacher = await Teacher.findByPk(req.params.id);
  if (!teacher) throw new ApiError(404, 'Teacher not found');

  const [assignment] = await TeacherSubject.findOrCreate({
    where: {
      teacherId: teacher.id,
      classId: req.body.classId,
      subjectId: req.body.subjectId
    }
  });

  res.status(201).json({ assignment });
});

const removeTeacherAssignment = asyncHandler(async (req, res) => {
  const deleted = await TeacherSubject.destroy({ where: { id: req.params.assignmentId } });
  if (!deleted) throw new ApiError(404, 'Teacher assignment not found');
  res.status(204).send();
});

const listTeacherAssignments = asyncHandler(async (_req, res) => {
  const assignments = await TeacherSubject.findAll({
    include: [
      { model: Teacher, as: 'teacher', include: [{ model: User, as: 'user', attributes: { exclude: ['password'] } }] },
      { model: Subject, as: 'subject' },
      { model: SchoolClass, as: 'class' }
    ],
    order: [['createdAt', 'DESC']]
  });
  res.json({ data: assignments });
});

module.exports = {
  createTeacherValidators,
  updateTeacherValidators,
  listTeachers,
  getTeacher,
  createTeacher,
  updateTeacher,
  deleteTeacher,
  assignTeacher,
  removeTeacherAssignment,
  listTeacherAssignments
};
