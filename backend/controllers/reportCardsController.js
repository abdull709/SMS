const { param, query } = require('express-validator');
const asyncHandler = require('../utils/asyncHandler');
const {
  assertCanAccessStudent,
  requireTeacherAssignment
} = require('../services/accessService');
const { buildReportCard, generateReportCardPdf } = require('../services/reportCardService');

const reportValidators = [
  param('studentId').isInt({ min: 1 }),
  query('term').isIn(['First Term', 'Second Term', 'Third Term']),
  query('session').trim().notEmpty()
];

const viewReportCard = asyncHandler(async (req, res) => {
  const student = await assertCanAccessStudent(req.user, req.params.studentId);
  if (req.user.role === 'teacher') {
    await requireTeacherAssignment(req.user, student.classId);
  }

  const data = await buildReportCard(
    req.params.studentId,
    req.query.term,
    req.query.session,
    req.user.role === 'admin' || req.user.role === 'teacher' ? req.user.id : null
  );

  res.json(data);
});

const downloadReportCard = asyncHandler(async (req, res) => {
  const student = await assertCanAccessStudent(req.user, req.params.studentId);
  if (req.user.role === 'teacher') {
    await requireTeacherAssignment(req.user, student.classId);
  }

  const data = await buildReportCard(
    req.params.studentId,
    req.query.term,
    req.query.session,
    req.user.role === 'admin' || req.user.role === 'teacher' ? req.user.id : null
  );
  const pdf = await generateReportCardPdf(data);
  const fileName = `${data.student.admissionNumber}-${data.term.replace(/\s+/g, '-')}-${data.session}.pdf`;

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
  res.send(pdf);
});

module.exports = {
  reportValidators,
  viewReportCard,
  downloadReportCard
};
