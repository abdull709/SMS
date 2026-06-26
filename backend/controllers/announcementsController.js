const { body } = require('express-validator');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { getPagination, pagedResponse } = require('../utils/pagination');
const { Announcement, User } = require('../models');

const announcementValidators = [
  body('title').trim().isLength({ min: 3 }),
  body('body').trim().isLength({ min: 3 }),
  body('visibleTo').optional().isArray()
];

function visibleToUser(item, role) {
  const visibleTo = Array.isArray(item.visibleTo) ? item.visibleTo : ['all'];
  return visibleTo.includes('all') || visibleTo.includes(role);
}

const listAnnouncements = asyncHandler(async (req, res) => {
  const { page, limit } = getPagination(req.query);
  const where = req.user.role === 'admin' ? {} : { status: 'published' };
  const all = await Announcement.findAll({
    where,
    include: [{ model: User, as: 'creator', attributes: { exclude: ['password'] } }],
    order: [['createdAt', 'DESC']]
  });

  const filtered = req.user.role === 'admin' ? all : all.filter((item) => visibleToUser(item, req.user.role));
  const start = (page - 1) * limit;
  res.json(pagedResponse(filtered.slice(start, start + limit), filtered.length, page, limit));
});

const createAnnouncement = asyncHandler(async (req, res) => {
  const announcement = await Announcement.create({
    title: req.body.title,
    body: req.body.body,
    visibleTo: req.body.visibleTo || ['all'],
    status: req.body.status || 'published',
    publishAt: req.body.publishAt || null,
    createdBy: req.user.id
  });
  res.status(201).json({ announcement });
});

const updateAnnouncement = asyncHandler(async (req, res) => {
  const announcement = await Announcement.findByPk(req.params.id);
  if (!announcement) throw new ApiError(404, 'Announcement not found');
  await announcement.update(req.body);
  res.json({ announcement });
});

const deleteAnnouncement = asyncHandler(async (req, res) => {
  const deleted = await Announcement.destroy({ where: { id: req.params.id } });
  if (!deleted) throw new ApiError(404, 'Announcement not found');
  res.status(204).send();
});

module.exports = {
  announcementValidators,
  listAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement
};
