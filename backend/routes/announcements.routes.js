const router = require('express').Router();
const { param } = require('express-validator');
const { authorize } = require('../middleware/auth');
const { validateRequest } = require('../middleware/errorHandler');
const {
  announcementValidators,
  listAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement
} = require('../controllers/announcementsController');

router.get('/', authorize('admin', 'teacher', 'student', 'parent'), listAnnouncements);
router.post('/', authorize('admin'), announcementValidators, validateRequest, createAnnouncement);
router.put('/:id', authorize('admin'), param('id').isInt({ min: 1 }), validateRequest, updateAnnouncement);
router.delete('/:id', authorize('admin'), param('id').isInt({ min: 1 }), validateRequest, deleteAnnouncement);

module.exports = router;
