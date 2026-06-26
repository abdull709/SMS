const router = require('express').Router();
const { param } = require('express-validator');
const { authorize } = require('../middleware/auth');
const { validateRequest } = require('../middleware/errorHandler');
const {
  saveGradeValidators,
  listGrades,
  saveGrade,
  updateGrade,
  deleteGrade
} = require('../controllers/gradesController');

router.get('/', authorize('admin', 'teacher', 'student', 'parent'), listGrades);
router.post('/', authorize('admin', 'teacher'), saveGradeValidators, validateRequest, saveGrade);
router.put('/:id', authorize('admin', 'teacher'), param('id').isInt({ min: 1 }), validateRequest, updateGrade);
router.delete('/:id', authorize('admin', 'teacher'), param('id').isInt({ min: 1 }), validateRequest, deleteGrade);

module.exports = router;
