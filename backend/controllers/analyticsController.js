const asyncHandler = require('../utils/asyncHandler');
const { getAdminAnalytics, getTeacherAnalytics } = require('../services/analyticsService');

const summary = asyncHandler(async (req, res) => {
  if (req.user.role === 'teacher') {
    return res.json(await getTeacherAnalytics(req.user));
  }
  return res.json(await getAdminAnalytics());
});

module.exports = { summary };
