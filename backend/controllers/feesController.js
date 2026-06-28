const { Op } = require('sequelize');
const asyncHandler = require('../utils/asyncHandler');
const { getPagination, pagedResponse } = require('../utils/pagination');
const { getAccessibleStudentIds, assertCanAccessStudent } = require('../services/accessService');
const { schoolWhere } = require('../services/tenantService');
const { FeePayment, Student, User } = require('../models');

const listFees = asyncHandler(async (req, res) => {
  const { page, limit, offset } = getPagination(req.query);
  const where = schoolWhere(req.user);
  const accessibleIds = await getAccessibleStudentIds(req.user);

  if (accessibleIds) where.studentId = { [Op.in]: accessibleIds.length ? accessibleIds : [-1] };
  if (req.query.studentId) {
    await assertCanAccessStudent(req.user, req.query.studentId);
    where.studentId = req.query.studentId;
  }
  if (req.query.term) where.term = req.query.term;
  if (req.query.session) where.session = req.query.session;

  const { rows, count } = await FeePayment.findAndCountAll({
    where,
    include: [{ model: Student, as: 'student', include: [{ model: User, as: 'user', attributes: { exclude: ['password'] } }] }],
    distinct: true,
    limit,
    offset,
    order: [['dueDate', 'ASC']]
  });

  res.json(pagedResponse(rows, count, page, limit));
});

const saveFee = asyncHandler(async (req, res) => {
  await assertCanAccessStudent(req.user, req.body.studentId);
  const [fee, created] = await FeePayment.findOrCreate({
    where: schoolWhere(req.user, {
      studentId: req.body.studentId,
      term: req.body.term,
      session: req.body.session
    }),
    defaults: { ...req.body, schoolId: req.user.schoolId ?? null }
  });

  if (!created) {
    await fee.update(req.body);
  }

  res.status(created ? 201 : 200).json({ fee });
});

module.exports = { listFees, saveFee };
