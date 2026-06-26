const router = require('express').Router();
const { authenticate } = require('../middleware/auth');

router.use('/auth', require('./auth.routes'));

router.use(authenticate);
router.use('/users', require('./users.routes'));
router.use('/students', require('./students.routes'));
router.use('/parents', require('./parents.routes'));
router.use('/teachers', require('./teachers.routes'));
router.use('/classes', require('./classes.routes'));
router.use('/subjects', require('./subjects.routes'));
router.use('/attendance', require('./attendance.routes'));
router.use('/grades', require('./grades.routes'));
router.use('/assignments', require('./assignments.routes'));
router.use('/announcements', require('./announcements.routes'));
router.use('/calendar-events', require('./calendar.routes'));
router.use('/report-cards', require('./reportCards.routes'));
router.use('/analytics', require('./analytics.routes'));
router.use('/fees', require('./fees.routes'));

module.exports = router;
