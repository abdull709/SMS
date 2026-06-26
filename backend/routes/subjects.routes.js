const router = require('express').Router();
const { param } = require('express-validator');
const { authorize } = require('../middleware/auth');
const { validateRequest } = require('../middleware/errorHandler');
const {
  subjectValidators,
  listSubjects,
  getSubject,
  createSubject,
  updateSubject,
  deleteSubject
} = require('../controllers/subjectsController');

router.get('/', authorize('admin', 'teacher', 'student', 'parent'), listSubjects);
router.post('/', authorize('admin'), subjectValidators, validateRequest, createSubject);
router.get('/:id', authorize('admin', 'teacher', 'student', 'parent'), param('id').isInt({ min: 1 }), validateRequest, getSubject);
router.put('/:id', authorize('admin'), param('id').isInt({ min: 1 }), subjectValidators, validateRequest, updateSubject);
router.delete('/:id', authorize('admin'), param('id').isInt({ min: 1 }), validateRequest, deleteSubject);

module.exports = router;
