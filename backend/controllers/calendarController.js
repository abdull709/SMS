const { body } = require('express-validator');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { getPagination, pagedResponse } = require('../utils/pagination');
const { schoolWhere } = require('../services/tenantService');
const { CalendarEvent, User } = require('../models');

const eventValidators = [
  body('title').trim().isLength({ min: 3 }),
  body('startDate').isISO8601(),
  body('type').optional().isIn(['academic', 'holiday', 'exam', 'meeting', 'event']),
  body('visibleTo').optional().isArray()
];

function visibleToUser(item, role) {
  const visibleTo = Array.isArray(item.visibleTo) ? item.visibleTo : ['all'];
  return visibleTo.includes('all') || visibleTo.includes(role);
}

const listEvents = asyncHandler(async (req, res) => {
  const { page, limit } = getPagination(req.query);
  const all = await CalendarEvent.findAll({
    where: schoolWhere(req.user),
    include: [{ model: User, as: 'creator', attributes: { exclude: ['password'] } }],
    order: [['startDate', 'ASC']]
  });

  const filtered = req.user.role === 'admin' ? all : all.filter((item) => visibleToUser(item, req.user.role));
  const start = (page - 1) * limit;
  res.json(pagedResponse(filtered.slice(start, start + limit), filtered.length, page, limit));
});

const createEvent = asyncHandler(async (req, res) => {
  const event = await CalendarEvent.create({
    title: req.body.title,
    description: req.body.description || null,
    startDate: req.body.startDate,
    endDate: req.body.endDate || null,
    type: req.body.type || 'event',
    schoolId: req.user.schoolId ?? null,
    visibleTo: req.body.visibleTo || ['all'],
    createdBy: req.user.id
  });
  res.status(201).json({ event });
});

const updateEvent = asyncHandler(async (req, res) => {
  const event = await CalendarEvent.findOne({ where: schoolWhere(req.user, { id: req.params.id }) });
  if (!event) throw new ApiError(404, 'Calendar event not found');
  await event.update(req.body);
  res.json({ event });
});

const deleteEvent = asyncHandler(async (req, res) => {
  const deleted = await CalendarEvent.destroy({ where: schoolWhere(req.user, { id: req.params.id }) });
  if (!deleted) throw new ApiError(404, 'Calendar event not found');
  res.status(204).send();
});

module.exports = {
  eventValidators,
  listEvents,
  createEvent,
  updateEvent,
  deleteEvent
};
