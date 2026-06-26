const router = require('express').Router();
const { param } = require('express-validator');
const { authorize } = require('../middleware/auth');
const { validateRequest } = require('../middleware/errorHandler');
const {
  classValidators,
  listClasses,
  getClass,
  createClass,
  updateClass,
  deleteClass
} = require('../controllers/classesController');

router.get('/', authorize('admin', 'teacher', 'student', 'parent'), listClasses);
router.post('/', authorize('admin'), classValidators, validateRequest, createClass);
router.get('/:id', authorize('admin', 'teacher', 'student', 'parent'), param('id').isInt({ min: 1 }), validateRequest, getClass);
router.put('/:id', authorize('admin'), param('id').isInt({ min: 1 }), classValidators, validateRequest, updateClass);
router.delete('/:id', authorize('admin'), param('id').isInt({ min: 1 }), validateRequest, deleteClass);

module.exports = router;
