const { Op } = require('sequelize');
const ApiError = require('../utils/ApiError');
const { schoolWhere } = require('./tenantService');
const {
  Student,
  Parent,
  Teacher,
  TeacherSubject,
  StudentParent,
  SchoolClass
} = require('../models');

async function getTeacherByUserId(userId) {
  const teacher = await Teacher.findOne({ where: { userId } });
  if (!teacher) throw new ApiError(403, 'Teacher profile not found');
  return teacher;
}

async function getStudentByUserId(userId) {
  const student = await Student.findOne({ where: { userId } });
  if (!student) throw new ApiError(403, 'Student profile not found');
  return student;
}

async function getParentByUserId(userId) {
  const parent = await Parent.findOne({ where: { userId } });
  if (!parent) throw new ApiError(403, 'Parent profile not found');
  return parent;
}

async function getTeacherScopedClassIds(user) {
  if (user.role === 'admin') return null;
  const teacher = await getTeacherByUserId(user.id);
  const assignments = await TeacherSubject.findAll({
    where: schoolWhere(user, { teacherId: teacher.id }),
    attributes: ['classId']
  });
  return [...new Set(assignments.map((item) => item.classId))];
}

async function requireTeacherAssignment(user, classId, subjectId = null) {
  if (user.role === 'admin') return null;
  const teacher = await getTeacherByUserId(user.id);
  const where = schoolWhere(user, { teacherId: teacher.id, classId });
  if (subjectId) where.subjectId = subjectId;

  const assignment = await TeacherSubject.findOne({ where });
  if (!assignment) {
    throw new ApiError(403, 'Teacher is not assigned to this class or subject');
  }
  return teacher;
}

async function resolveTeacherIdForWrite(user, payloadTeacherId, classId, subjectId = null) {
  if (user.role === 'admin') {
    if (!payloadTeacherId) throw new ApiError(422, 'teacherId is required for admin-created records');
    const teacher = await Teacher.findOne({ where: schoolWhere(user, { id: payloadTeacherId }) });
    if (!teacher) throw new ApiError(422, 'Teacher does not belong to this school');
    return teacher.id;
  }

  const teacher = await requireTeacherAssignment(user, classId, subjectId);
  return teacher.id;
}

async function getAccessibleStudentIds(user) {
  if (user.role === 'admin') return null;

  if (user.role === 'student') {
    const student = await getStudentByUserId(user.id);
    return [student.id];
  }

  if (user.role === 'parent') {
    const parent = await getParentByUserId(user.id);
    const links = await StudentParent.findAll({
      where: schoolWhere(user, { parentId: parent.id }),
      attributes: ['studentId']
    });
    return links.map((link) => link.studentId);
  }

  if (user.role === 'teacher') {
    const classIds = await getTeacherScopedClassIds(user);
    if (!classIds.length) return [];
    const students = await Student.findAll({
      where: schoolWhere(user, { classId: { [Op.in]: classIds } }),
      attributes: ['id']
    });
    return students.map((student) => student.id);
  }

  return [];
}

async function assertCanAccessStudent(user, studentId) {
  const student = await Student.findOne({
    where: schoolWhere(user, { id: studentId }),
    include: [{ model: SchoolClass, as: 'class' }]
  });
  if (!student) throw new ApiError(404, 'Student not found');

  if (user.role === 'admin') return student;

  if (user.role === 'student') {
    const ownStudent = await getStudentByUserId(user.id);
    if (ownStudent.id === Number(studentId)) return student;
  }

  if (user.role === 'parent') {
    const parent = await getParentByUserId(user.id);
    const link = await StudentParent.findOne({
      where: schoolWhere(user, { studentId, parentId: parent.id })
    });
    if (link) return student;
  }

  if (user.role === 'teacher') {
    const classIds = await getTeacherScopedClassIds(user);
    if (classIds.includes(student.classId)) return student;
  }

  throw new ApiError(403, 'You cannot access this student record');
}

module.exports = {
  assertCanAccessStudent,
  getAccessibleStudentIds,
  getParentByUserId,
  getStudentByUserId,
  getTeacherByUserId,
  getTeacherScopedClassIds,
  requireTeacherAssignment,
  resolveTeacherIdForWrite
};
