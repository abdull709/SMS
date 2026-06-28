const { body, param } = require('express-validator');
const { Op } = require('sequelize');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { getPagination, pagedResponse } = require('../utils/pagination');
const {
  assertCanAccessStudent,
  getAccessibleStudentIds,
  requireTeacherAssignment,
  resolveTeacherIdForWrite
} = require('../services/accessService');
const { assertSchoolRecord, schoolWhere } = require('../services/tenantService');
const {
  Attendance,
  Student,
  User,
  SchoolClass,
  Teacher
} = require('../models');

const attendanceIncludes = [
  { model: Student, as: 'student', include: [{ model: User, as: 'user', attributes: { exclude: ['password'] } }] },
  { model: SchoolClass, as: 'class' },
  { model: Teacher, as: 'teacher', include: [{ model: User, as: 'user', attributes: { exclude: ['password'] } }] }
];

const markAttendanceValidators = [
  body('classId').isInt({ min: 1 }),
  body('date').isISO8601(),
  body('records').isArray({ min: 1 }),
  body('records.*.studentId').isInt({ min: 1 }),
  body('records.*.status').isIn(['present', 'absent', 'late', 'excused'])
];

const updateAttendanceValidators = [
  param('id').isInt({ min: 1 }),
  body('status').optional().isIn(['present', 'absent', 'late', 'excused'])
];

const listAttendance = asyncHandler(async (req, res) => {
  const { page, limit, offset } = getPagination(req.query);
  const where = schoolWhere(req.user);
  const accessibleIds = await getAccessibleStudentIds(req.user);

  if (accessibleIds) where.studentId = { [Op.in]: accessibleIds.length ? accessibleIds : [-1] };
  if (req.query.studentId) {
    await assertCanAccessStudent(req.user, req.query.studentId);
    where.studentId = req.query.studentId;
  }
  if (req.query.classId) where.classId = req.query.classId;
  if (req.query.date) where.date = req.query.date;

  const { rows, count } = await Attendance.findAndCountAll({
    where,
    include: attendanceIncludes,
    distinct: true,
    limit,
    offset,
    order: [['date', 'DESC']]
  });

  res.json(pagedResponse(rows, count, page, limit));
});

const markAttendance = asyncHandler(async (req, res) => {
  await assertSchoolRecord(SchoolClass, req.body.classId, req.user, 'Class');
  const teacherId = await resolveTeacherIdForWrite(req.user, req.body.teacherId, req.body.classId);
  const teacher = req.user.role === 'teacher' ? await requireTeacherAssignment(req.user, req.body.classId) : null;

  const records = [];
  for (const item of req.body.records) {
    const student = await Student.findOne({ where: schoolWhere(req.user, { id: item.studentId }) });
    if (!student || student.classId !== Number(req.body.classId)) {
      throw new ApiError(422, `Student ${item.studentId} does not belong to the selected class`);
    }
    if (teacher && !teacher.id) {
      throw new ApiError(403, 'Teacher profile is required');
    }

    const existing = await Attendance.findOne({
      where: schoolWhere(req.user, { studentId: item.studentId, date: req.body.date })
    });

    if (existing) {
      await existing.update({
        classId: req.body.classId,
        teacherId,
        status: item.status,
        remarks: item.remarks || null
      });
      records.push(existing);
    } else {
      records.push(await Attendance.create({
        studentId: item.studentId,
        schoolId: req.user.schoolId ?? null,
        classId: req.body.classId,
        teacherId,
        date: req.body.date,
        status: item.status,
        remarks: item.remarks || null
      }));
    }
  }

  res.status(201).json({ data: records });
});

const updateAttendance = asyncHandler(async (req, res) => {
  const attendance = await Attendance.findOne({ where: schoolWhere(req.user, { id: req.params.id }) });
  if (!attendance) throw new ApiError(404, 'Attendance record not found');

  if (req.user.role === 'teacher') {
    await requireTeacherAssignment(req.user, attendance.classId);
  } else {
    await assertCanAccessStudent(req.user, attendance.studentId);
  }

  const update = {};
  ['status', 'remarks'].forEach((key) => {
    if (req.body[key] !== undefined) update[key] = req.body[key];
  });
  await attendance.update(update);
  res.json({ attendance });
});

const deleteAttendance = asyncHandler(async (req, res) => {
  const attendance = await Attendance.findOne({ where: schoolWhere(req.user, { id: req.params.id }) });
  if (!attendance) throw new ApiError(404, 'Attendance record not found');
  if (req.user.role === 'teacher') await requireTeacherAssignment(req.user, attendance.classId);
  await attendance.destroy();
  res.status(204).send();
});

module.exports = {
  markAttendanceValidators,
  updateAttendanceValidators,
  listAttendance,
  markAttendance,
  updateAttendance,
  deleteAttendance
};
