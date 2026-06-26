const router = require('express').Router();
const { body, param } = require('express-validator');
const { authorize } = require('../middleware/auth');
const { validateRequest } = require('../middleware/errorHandler');
const {
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
} = require('../controllers/teachersController');

router.get('/', authorize('admin', 'teacher'), listTeachers);
router.post('/', authorize('admin'), createTeacherValidators, validateRequest, createTeacher);
router.get('/assignments', authorize('admin'), listTeacherAssignments);
router.post(
  '/:id/assignments',
  authorize('admin'),
  param('id').isInt({ min: 1 }),
  body('classId').isInt({ min: 1 }),
  body('subjectId').isInt({ min: 1 }),
  validateRequest,
  assignTeacher
);
router.delete('/assignments/:assignmentId', authorize('admin'), param('assignmentId').isInt({ min: 1 }), validateRequest, removeTeacherAssignment);
router.get('/:id', authorize('admin', 'teacher'), param('id').isInt({ min: 1 }), validateRequest, getTeacher);
router.put('/:id', authorize('admin'), updateTeacherValidators, validateRequest, updateTeacher);
router.delete('/:id', authorize('admin'), param('id').isInt({ min: 1 }), validateRequest, deleteTeacher);

module.exports = router;
