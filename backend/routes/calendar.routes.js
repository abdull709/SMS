const router = require('express').Router();
const { param } = require('express-validator');
const { authorize } = require('../middleware/auth');
const { validateRequest } = require('../middleware/errorHandler');
const {
  eventValidators,
  listEvents,
  createEvent,
  updateEvent,
  deleteEvent
} = require('../controllers/calendarController');

router.get('/', authorize('admin', 'teacher', 'student', 'parent'), listEvents);
router.post('/', authorize('admin'), eventValidators, validateRequest, createEvent);
router.put('/:id', authorize('admin'), param('id').isInt({ min: 1 }), validateRequest, updateEvent);
router.delete('/:id', authorize('admin'), param('id').isInt({ min: 1 }), validateRequest, deleteEvent);

module.exports = router;
