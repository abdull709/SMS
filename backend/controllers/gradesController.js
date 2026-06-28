const { body, param } = require('express-validator');
const { Op } = require('sequelize');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { calculateGrade } = require('../utils/grade');
const { getPagination, pagedResponse } = require('../utils/pagination');
const {
  assertCanAccessStudent,
  getAccessibleStudentIds,
  requireTeacherAssignment,
  resolveTeacherIdForWrite
} = require('../services/accessService');
const { assertSchoolRecord, schoolWhere } = require('../services/tenantService');
const {
  Grade,
  Student,
  User,
  Subject,
  SchoolClass,
  Teacher
} = require('../models');

const gradeIncludes = [
  { model: Student, as: 'student', include: [{ model: User, as: 'user', attributes: { exclude: ['password'] } }] },
  { model: Subject, as: 'subject' },
  { model: SchoolClass, as: 'class' },
  { model: Teacher, as: 'teacher', include: [{ model: User, as: 'user', attributes: { exclude: ['password'] } }] }
];

const saveGradeValidators = [
  body('studentId').isInt({ min: 1 }),
  body('subjectId').isInt({ min: 1 }),
  body('classId').isInt({ min: 1 }),
  body('term').isIn(['First Term', 'Second Term', 'Third Term']),
  body('session').trim().notEmpty(),
  body('assessmentScore').isFloat({ min: 0, max: 40 }),
  body('examScore').isFloat({ min: 0, max: 60 })
];

const listGrades = asyncHandler(async (req, res) => {
  const { page, limit, offset } = getPagination(req.query);
  const where = schoolWhere(req.user);
  const accessibleIds = await getAccessibleStudentIds(req.user);

  if (accessibleIds) where.studentId = { [Op.in]: accessibleIds.length ? accessibleIds : [-1] };
  if (req.query.studentId) {
    await assertCanAccessStudent(req.user, req.query.studentId);
    where.studentId = req.query.studentId;
  }
  if (req.query.classId) where.classId = req.query.classId;
  if (req.query.subjectId) where.subjectId = req.query.subjectId;
  if (req.query.term) where.term = req.query.term;
  if (req.query.session) where.session = req.query.session;

  const { rows, count } = await Grade.findAndCountAll({
    where,
    include: gradeIncludes,
    distinct: true,
    limit,
    offset,
    order: [['session', 'DESC'], ['term', 'ASC']]
  });

  res.json(pagedResponse(rows, count, page, limit));
});

const saveGrade = asyncHandler(async (req, res) => {
  const student = await Student.findOne({ where: schoolWhere(req.user, { id: req.body.studentId }) });
  if (!student || student.classId !== Number(req.body.classId)) {
    throw new ApiError(422, 'Student does not belong to the selected class');
  }
  await assertSchoolRecord(SchoolClass, req.body.classId, req.user, 'Class');
  await assertSchoolRecord(Subject, req.body.subjectId, req.user, 'Subject');

  const teacherId = await resolveTeacherIdForWrite(
    req.user,
    req.body.teacherId,
    req.body.classId,
    req.body.subjectId
  );
  const calculated = calculateGrade(req.body.assessmentScore, req.body.examScore);

  const [grade, created] = await Grade.findOrCreate({
    where: {
      schoolId: req.user.schoolId ?? null,
      studentId: req.body.studentId,
      subjectId: req.body.subjectId,
      term: req.body.term,
      session: req.body.session
    },
    defaults: {
      studentId: req.body.studentId,
      schoolId: req.user.schoolId ?? null,
      subjectId: req.body.subjectId,
      classId: req.body.classId,
      teacherId,
      assessmentScore: req.body.assessmentScore,
      examScore: req.body.examScore,
      totalScore: calculated.totalScore,
      grade: calculated.grade,
      remarks: req.body.remarks || calculated.remarks,
      term: req.body.term,
      session: req.body.session
    }
  });

  if (!created) {
    await grade.update({
      classId: req.body.classId,
      teacherId,
      assessmentScore: req.body.assessmentScore,
      examScore: req.body.examScore,
      totalScore: calculated.totalScore,
      grade: calculated.grade,
      remarks: req.body.remarks || calculated.remarks
    });
  }

  const hydrated = await Grade.findOne({ where: schoolWhere(req.user, { id: grade.id }), include: gradeIncludes });
  res.status(created ? 201 : 200).json({ grade: hydrated });
});

const updateGrade = asyncHandler(async (req, res) => {
  const grade = await Grade.findOne({ where: schoolWhere(req.user, { id: req.params.id }) });
  if (!grade) throw new ApiError(404, 'Grade not found');

  if (req.user.role === 'teacher') {
    await requireTeacherAssignment(req.user, grade.classId, grade.subjectId);
  }

  const assessmentScore = req.body.assessmentScore !== undefined ? req.body.assessmentScore : grade.assessmentScore;
  const examScore = req.body.examScore !== undefined ? req.body.examScore : grade.examScore;
  const calculated = calculateGrade(assessmentScore, examScore);

  await grade.update({
    assessmentScore,
    examScore,
    totalScore: calculated.totalScore,
    grade: calculated.grade,
    remarks: req.body.remarks || calculated.remarks
  });

  res.json({ grade });
});

const deleteGrade = asyncHandler(async (req, res) => {
  const grade = await Grade.findOne({ where: schoolWhere(req.user, { id: req.params.id }) });
  if (!grade) throw new ApiError(404, 'Grade not found');
  if (req.user.role === 'teacher') await requireTeacherAssignment(req.user, grade.classId, grade.subjectId);
  await grade.destroy();
  res.status(204).send();
});

module.exports = {
  saveGradeValidators,
  listGrades,
  saveGrade,
  updateGrade,
  deleteGrade
};
