const jwt = require('jsonwebtoken');
const { School, User } = require('../models');
const ApiError = require('../utils/ApiError');
const { decorateSuperAdmin } = require('../services/superAdminService');

const schoolInclude = [{ model: School, as: 'school', attributes: ['id', 'name', 'slug'] }];

async function authenticate(req, _res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return next(new ApiError(401, 'Authentication token is required'));
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(payload.id, {
      attributes: { exclude: ['password'] },
      include: schoolInclude
    });

    if (!user || !user.isActive) {
      return next(new ApiError(401, 'Invalid or inactive user'));
    }

    req.user = decorateSuperAdmin(user);
    return next();
  } catch (_error) {
    return next(new ApiError(401, 'Invalid or expired token'));
  }
}

async function optionalAuthenticate(req, _res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return next();

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(payload.id, {
      attributes: { exclude: ['password'] },
      include: schoolInclude
    });
    if (user && user.isActive) req.user = decorateSuperAdmin(user);
  } catch (_error) {
    return next(new ApiError(401, 'Invalid or expired token'));
  }

  return next();
}

function authorize(...roles) {
  return (req, _res, next) => {
    if (!req.user) return next(new ApiError(401, 'Authentication is required'));
    if (!roles.includes(req.user.role)) {
      return next(new ApiError(403, 'You do not have permission to perform this action'));
    }
    return next();
  };
}

module.exports = { authenticate, optionalAuthenticate, authorize };
