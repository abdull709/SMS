const router = require('express').Router();
const { authorize } = require('../middleware/auth');
const { validateRequest } = require('../middleware/errorHandler');
const {
  reportValidators,
  viewReportCard,
  downloadReportCard
} = require('../controllers/reportCardsController');

router.get('/student/:studentId', authorize('admin', 'teacher', 'student', 'parent'), reportValidators, validateRequest, viewReportCard);
router.get('/student/:studentId/pdf', authorize('admin', 'teacher', 'student', 'parent'), reportValidators, validateRequest, downloadReportCard);

module.exports = router;
