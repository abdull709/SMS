const ApiError = require('../utils/ApiError');
const { School } = require('../models');

function schoolIdOf(source) {
  return source?.schoolId ?? null;
}

function schoolWhere(source, extra = {}) {
  return {
    ...extra,
    schoolId: schoolIdOf(source)
  };
}

function sameSchool(left, right) {
  const leftId = left ?? null;
  const rightId = right ?? null;
  return leftId === rightId || String(leftId) === String(rightId);
}

function assertSameSchool(record, user, label = 'Record') {
  if (!record || !sameSchool(record.schoolId, schoolIdOf(user))) {
    throw new ApiError(404, `${label} not found`);
  }
  return record;
}

async function findSchoolScoped(Model, id, user, options = {}) {
  const record = await Model.findOne({
    ...options,
    where: {
      ...(options.where || {}),
      id,
      schoolId: schoolIdOf(user)
    }
  });
  return record;
}

async function assertSchoolRecord(Model, id, user, label, options = {}) {
  const record = await findSchoolScoped(Model, id, user, options);
  if (!record) throw new ApiError(422, `${label} does not belong to this school`);
  return record;
}

function slugify(value) {
  return String(value || 'school')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 140) || 'school';
}

async function createSchoolForAdmin(payload, transaction) {
  const baseName = payload.schoolName || `${payload.firstName} ${payload.lastName} School`;
  const baseSlug = slugify(baseName);
  let slug = baseSlug;
  let suffix = 1;

  while (await School.findOne({ where: { slug }, transaction })) {
    suffix += 1;
    slug = `${baseSlug}-${suffix}`;
  }

  return School.create({
    name: baseName,
    slug
  }, { transaction });
}

module.exports = {
  assertSameSchool,
  assertSchoolRecord,
  createSchoolForAdmin,
  findSchoolScoped,
  sameSchool,
  schoolIdOf,
  schoolWhere
};
