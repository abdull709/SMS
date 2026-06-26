const router = require('express').Router();
const { body, param } = require('express-validator');
const { authorize } = require('../middleware/auth');
const { validateRequest } = require('../middleware/errorHandler');
const {
  assignmentValidators,
  listAssignments,
  createAssignment,
  updateAssignment,
  deleteAssignment,
  submitAssignment,
  gradeSubmission
} = require('../controllers/assignmentsController');

router.get('/', authorize('admin', 'teacher', 'student', 'parent'), listAssignments);
router.post('/', authorize('admin', 'teacher'), assignmentValidators, validateRequest, createAssignment);
router.put('/:id', authorize('admin', 'teacher'), param('id').isInt({ min: 1 }), validateRequest, updateAssignment);
router.delete('/:id', authorize('admin', 'teacher'), param('id').isInt({ min: 1 }), validateRequest, deleteAssignment);
router.post('/:id/submissions', authorize('student', 'admin'), param('id').isInt({ min: 1 }), validateRequest, submitAssignment);
router.put(
  '/:id/submissions/:submissionId',
  authorize('admin', 'teacher'),
  param('id').isInt({ min: 1 }),
  param('submissionId').isInt({ min: 1 }),
  body('score').isFloat({ min: 0 }),
  validateRequest,
  gradeSubmission
);

module.exports = router;
