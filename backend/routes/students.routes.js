const router = require('express').Router();
const { body, param } = require('express-validator');
const { authorize } = require('../middleware/auth');
const { validateRequest } = require('../middleware/errorHandler');
const {
  createStudentValidators,
  updateStudentValidators,
  listStudents,
  getStudent,
  createStudent,
  updateStudent,
  deleteStudent,
  linkParent
} = require('../controllers/studentsController');

router.get('/', authorize('admin', 'teacher', 'student', 'parent'), listStudents);
router.post('/', authorize('admin'), createStudentValidators, validateRequest, createStudent);
router.get('/:id', authorize('admin', 'teacher', 'student', 'parent'), param('id').isInt({ min: 1 }), validateRequest, getStudent);
router.put('/:id', authorize('admin'), updateStudentValidators, validateRequest, updateStudent);
router.delete('/:id', authorize('admin'), param('id').isInt({ min: 1 }), validateRequest, deleteStudent);
router.post(
  '/:id/parents',
  authorize('admin'),
  param('id').isInt({ min: 1 }),
  body('parentId').isInt({ min: 1 }),
  validateRequest,
  linkParent
);

module.exports = router;
