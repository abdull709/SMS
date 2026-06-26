const router = require('express').Router();
const { param } = require('express-validator');
const { authorize } = require('../middleware/auth');
const { validateRequest } = require('../middleware/errorHandler');
const {
  markAttendanceValidators,
  updateAttendanceValidators,
  listAttendance,
  markAttendance,
  updateAttendance,
  deleteAttendance
} = require('../controllers/attendanceController');

router.get('/', authorize('admin', 'teacher', 'student', 'parent'), listAttendance);
router.post('/', authorize('admin', 'teacher'), markAttendanceValidators, validateRequest, markAttendance);
router.put('/:id', authorize('admin', 'teacher'), updateAttendanceValidators, validateRequest, updateAttendance);
router.delete('/:id', authorize('admin', 'teacher'), param('id').isInt({ min: 1 }), validateRequest, deleteAttendance);

module.exports = router;
