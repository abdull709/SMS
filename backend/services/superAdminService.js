const ApiError = require('../utils/ApiError');

const SUPER_ADMIN_EMAIL = String(process.env.SUPER_ADMIN_EMAIL || 'abba@smartschool.test').trim().toLowerCase();

function normalizeEmail(value) {
  return String(value || '').trim().toLowerCase();
}

function isSuperAdmin(user) {
  return user?.role === 'admin' && normalizeEmail(user.email) === SUPER_ADMIN_EMAIL;
}

function decorateSuperAdmin(user) {
  if (!user) return user;

  if (typeof user.setDataValue === 'function') {
    user.setDataValue('isSuperAdmin', isSuperAdmin(user));
    return user;
  }

  return {
    ...user,
    isSuperAdmin: isSuperAdmin(user)
  };
}

function requireSuperAdmin(user) {
  if (!isSuperAdmin(user)) {
    throw new ApiError(403, 'Only the super admin can manage admin accounts');
  }
}

module.exports = {
  SUPER_ADMIN_EMAIL,
  decorateSuperAdmin,
  isSuperAdmin,
  normalizeEmail,
  requireSuperAdmin
};
