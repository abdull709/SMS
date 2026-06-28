const { body, param } = require('express-validator');
const { Op } = require('sequelize');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { getPagination, pagedResponse } = require('../utils/pagination');
const { getTeacherScopedClassIds, getStudentByUserId, getParentByUserId } = require('../services/accessService');
const { assertSchoolRecord, schoolWhere } = require('../services/tenantService');
const { SchoolClass, Teacher, User, Student, StudentParent } = require('../models');

const classIncludes = [
  { model: Teacher, as: 'classTeacher', include: [{ model: User, as: 'user', attributes: { exclude: ['password'] } }] }
];

const classValidators = [
  body('name').trim().isLength({ min: 2 }),
  body('level').isIn(['nursery', 'primary', 'secondary']),
  body('academicSession').trim().notEmpty()
];

const listClasses = asyncHandler(async (req, res) => {
  const { page, limit, offset } = getPagination(req.query);
  const where = schoolWhere(req.user);

  if (req.query.level) where.level = req.query.level;
  if (req.query.search) where.name = { [Op.like]: `%${req.query.search}%` };

  if (req.user.role === 'teacher') {
    const classIds = await getTeacherScopedClassIds(req.user);
    where.id = { [Op.in]: classIds.length ? classIds : [-1] };
  }

  if (req.user.role === 'student') {
    const student = await getStudentByUserId(req.user.id);
    where.id = student.classId;
  }

  if (req.user.role === 'parent') {
    const parent = await getParentByUserId(req.user.id);
    const links = await StudentParent.findAll({ where: schoolWhere(req.user, { parentId: parent.id }), attributes: ['studentId'] });
    const students = await Student.findAll({ where: schoolWhere(req.user, { id: { [Op.in]: links.map((link) => link.studentId) } }) });
    where.id = { [Op.in]: [...new Set(students.map((student) => student.classId))] };
  }

  const { rows, count } = await SchoolClass.findAndCountAll({
    where,
    include: classIncludes,
    distinct: true,
    limit,
    offset,
    order: [['level', 'ASC'], ['name', 'ASC']]
  });

  res.json(pagedResponse(rows, count, page, limit));
});

const getClass = asyncHandler(async (req, res) => {
  const schoolClass = await SchoolClass.findOne({ where: schoolWhere(req.user, { id: req.params.id }), include: classIncludes });
  if (!schoolClass) throw new ApiError(404, 'Class not found');
  res.json({ class: schoolClass });
});

const createClass = asyncHandler(async (req, res) => {
  if (req.body.classTeacherId) {
    await assertSchoolRecord(Teacher, req.body.classTeacherId, req.user, 'Class teacher');
  }
  const schoolClass = await SchoolClass.create({ ...req.body, schoolId: req.user.schoolId ?? null });
  res.status(201).json({ class: schoolClass });
});

const updateClass = asyncHandler(async (req, res) => {
  const schoolClass = await SchoolClass.findOne({ where: schoolWhere(req.user, { id: req.params.id }) });
  if (!schoolClass) throw new ApiError(404, 'Class not found');
  if (req.body.classTeacherId) {
    await assertSchoolRecord(Teacher, req.body.classTeacherId, req.user, 'Class teacher');
  }
  await schoolClass.update(req.body);
  res.json({ class: schoolClass });
});

const deleteClass = asyncHandler(async (req, res) => {
  const deleted = await SchoolClass.destroy({ where: schoolWhere(req.user, { id: req.params.id }) });
  if (!deleted) throw new ApiError(404, 'Class not found');
  res.status(204).send();
});

module.exports = {
  classValidators,
  listClasses,
  getClass,
  createClass,
  updateClass,
  deleteClass
};
