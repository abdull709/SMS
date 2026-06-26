const { body } = require('express-validator');
const { Op } = require('sequelize');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { getPagination, pagedResponse } = require('../utils/pagination');
const { getTeacherByUserId } = require('../services/accessService');
const { Subject, TeacherSubject } = require('../models');

const subjectValidators = [
  body('name').trim().isLength({ min: 2 }),
  body('code').trim().isLength({ min: 2 }),
  body('level').optional().isIn(['nursery', 'primary', 'secondary', 'all'])
];

const listSubjects = asyncHandler(async (req, res) => {
  const { page, limit, offset } = getPagination(req.query);
  const where = {};

  if (req.query.level) where.level = { [Op.in]: [req.query.level, 'all'] };
  if (req.query.search) where.name = { [Op.like]: `%${req.query.search}%` };

  if (req.user.role === 'teacher') {
    const teacher = await getTeacherByUserId(req.user.id);
    const assignments = await TeacherSubject.findAll({
      where: { teacherId: teacher.id },
      attributes: ['subjectId']
    });
    where.id = { [Op.in]: assignments.map((assignment) => assignment.subjectId) };
  }

  const { rows, count } = await Subject.findAndCountAll({
    where,
    limit,
    offset,
    order: [['name', 'ASC']]
  });

  res.json(pagedResponse(rows, count, page, limit));
});

const getSubject = asyncHandler(async (req, res) => {
  const subject = await Subject.findByPk(req.params.id);
  if (!subject) throw new ApiError(404, 'Subject not found');
  res.json({ subject });
});

const createSubject = asyncHandler(async (req, res) => {
  const subject = await Subject.create(req.body);
  res.status(201).json({ subject });
});

const updateSubject = asyncHandler(async (req, res) => {
  const subject = await Subject.findByPk(req.params.id);
  if (!subject) throw new ApiError(404, 'Subject not found');
  await subject.update(req.body);
  res.json({ subject });
});

const deleteSubject = asyncHandler(async (req, res) => {
  const deleted = await Subject.destroy({ where: { id: req.params.id } });
  if (!deleted) throw new ApiError(404, 'Subject not found');
  res.status(204).send();
});

module.exports = {
  subjectValidators,
  listSubjects,
  getSubject,
  createSubject,
  updateSubject,
  deleteSubject
};
