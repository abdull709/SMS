const router = require('express').Router();
const { body } = require('express-validator');
const { authorize } = require('../middleware/auth');
const { validateRequest } = require('../middleware/errorHandler');
const { listFees, saveFee } = require('../controllers/feesController');

router.get('/', authorize('admin', 'parent', 'student'), listFees);
router.post(
  '/',
  authorize('admin'),
  body('studentId').isInt({ min: 1 }),
  body('term').isIn(['First Term', 'Second Term', 'Third Term']),
  body('session').trim().notEmpty(),
  body('amountDue').isFloat({ min: 0 }),
  body('amountPaid').isFloat({ min: 0 }),
  validateRequest,
  saveFee
);

module.exports = router;
