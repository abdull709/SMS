const { body, param } = require('express-validator');
const { Op } = require('sequelize');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { getPagination, pagedResponse } = require('../utils/pagination');
const {
  getAccessibleStudentIds,
  getStudentByUserId,
  assertCanAccessStudent,
  requireTeacherAssignment,
  resolveTeacherIdForWrite
} = require('../services/accessService');
const {
  Assignment,
  AssignmentSubmission,
  Student,
  User,
  Subject,
  SchoolClass,
  Teacher
} = require('../models');

const assignmentIncludes = [
  { model: Subject, as: 'subject' },
  { model: SchoolClass, as: 'class' },
  { model: Teacher, as: 'teacher', include: [{ model: User, as: 'user', attributes: { exclude: ['password'] } }] },
  {
    model: AssignmentSubmission,
    as: 'submissions',
    include: [{ model: Student, as: 'student', include: [{ model: User, as: 'user', attributes: { exclude: ['password'] } }] }]
  }
];

const assignmentValidators = [
  body('title').trim().isLength({ min: 3 }),
  body('description').trim().isLength({ min: 3 }),
  body('subjectId').isInt({ min: 1 }),
  body('classId').isInt({ min: 1 }),
  body('dueDate').isISO8601()
];

async function createPendingSubmissions(assignment) {
  const students = await Student.findAll({ where: { classId: assignment.classId } });
  await Promise.all(students.map((student) => AssignmentSubmission.findOrCreate({
    where: { assignmentId: assignment.id, studentId: student.id },
    defaults: { status: 'pending' }
  })));
}

const listAssignments = asyncHandler(async (req, res) => {
  const { page, limit, offset } = getPagination(req.query);
  const where = {};

  if (req.query.classId) where.classId = req.query.classId;
  if (req.query.subjectId) where.subjectId = req.query.subjectId;
  if (req.query.status) where.status = req.query.status;

  if (req.user.role === 'teacher') {
    const classIds = await getAccessibleStudentIds(req.user);
    const students = await Student.findAll({ where: { id: { [Op.in]: classIds.length ? classIds : [-1] } } });
    where.classId = { [Op.in]: [...new Set(students.map((student) => student.classId))] };
  }

  if (req.user.role === 'student') {
    const student = await getStudentByUserId(req.user.id);
    where.classId = student.classId;
  }

  if (req.user.role === 'parent') {
    const ids = await getAccessibleStudentIds(req.user);
    const students = await Student.findAll({ where: { id: { [Op.in]: ids.length ? ids : [-1] } } });
    where.classId = { [Op.in]: [...new Set(students.map((student) => student.classId))] };
  }

  const { rows, count } = await Assignment.findAndCountAll({
    where,
    include: assignmentIncludes,
    distinct: true,
    limit,
    offset,
    order: [['dueDate', 'ASC']]
  });

  res.json(pagedResponse(rows, count, page, limit));
});

const createAssignment = asyncHandler(async (req, res) => {
  const teacherId = await resolveTeacherIdForWrite(req.user, req.body.teacherId, req.body.classId, req.body.subjectId);
  const assignment = await Assignment.create({
    title: req.body.title,
    description: req.body.description,
    teacherId,
    subjectId: req.body.subjectId,
    classId: req.body.classId,
    dueDate: req.body.dueDate,
    totalMarks: req.body.totalMarks || 100,
    status: req.body.status || 'published'
  });

  if (assignment.status === 'published') await createPendingSubmissions(assignment);
  const hydrated = await Assignment.findByPk(assignment.id, { include: assignmentIncludes });
  res.status(201).json({ assignment: hydrated });
});

const updateAssignment = asyncHandler(async (req, res) => {
  const assignment = await Assignment.findByPk(req.params.id);
  if (!assignment) throw new ApiError(404, 'Assignment not found');
  if (req.user.role === 'teacher') await requireTeacherAssignment(req.user, assignment.classId, assignment.subjectId);

  await assignment.update(req.body);
  if (assignment.status === 'published') await createPendingSubmissions(assignment);
  const hydrated = await Assignment.findByPk(assignment.id, { include: assignmentIncludes });
  res.json({ assignment: hydrated });
});

const deleteAssignment = asyncHandler(async (req, res) => {
  const assignment = await Assignment.findByPk(req.params.id);
  if (!assignment) throw new ApiError(404, 'Assignment not found');
  if (req.user.role === 'teacher') await requireTeacherAssignment(req.user, assignment.classId, assignment.subjectId);
  await assignment.destroy();
  res.status(204).send();
});

const submitAssignment = asyncHandler(async (req, res) => {
  const assignment = await Assignment.findByPk(req.params.id);
  if (!assignment) throw new ApiError(404, 'Assignment not found');

  const student = req.user.role === 'student'
    ? await getStudentByUserId(req.user.id)
    : await assertCanAccessStudent(req.user, req.body.studentId);

  if (student.classId !== assignment.classId) {
    throw new ApiError(403, 'This assignment does not belong to the student class');
  }

  const [submission] = await AssignmentSubmission.findOrCreate({
    where: { assignmentId: assignment.id, studentId: student.id },
    defaults: { status: 'submitted', submittedAt: new Date() }
  });

  await submission.update({
    status: 'submitted',
    submittedAt: new Date(),
    feedback: req.body.feedback || submission.feedback
  });

  res.json({ submission });
});

const gradeSubmission = asyncHandler(async (req, res) => {
  const submission = await AssignmentSubmission.findByPk(req.params.submissionId, {
    include: [{ model: Assignment, as: 'assignment' }]
  });
  if (!submission) throw new ApiError(404, 'Submission not found');
  if (req.user.role === 'teacher') {
    await requireTeacherAssignment(req.user, submission.assignment.classId, submission.assignment.subjectId);
  }

  await submission.update({
    status: 'graded',
    score: req.body.score,
    feedback: req.body.feedback || null
  });

  res.json({ submission });
});

module.exports = {
  assignmentValidators,
  listAssignments,
  createAssignment,
  updateAssignment,
  deleteAssignment,
  submitAssignment,
  gradeSubmission
};
