const router = require('express').Router();
const { authorize } = require('../middleware/auth');
const { summary } = require('../controllers/analyticsController');

router.get('/summary', authorize('admin', 'teacher'), summary);

module.exports = router;
