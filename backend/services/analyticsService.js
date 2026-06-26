const { Op, fn, col } = require('sequelize');
const {
  User,
  Student,
  Teacher,
  Parent,
  SchoolClass,
  Attendance,
  Grade,
  Assignment,
  AssignmentSubmission,
  TeacherSubject
} = require('../models');
const {
  getTeacherByUserId,
  getTeacherScopedClassIds
} = require('./accessService');

async function attendancePercentage(where = {}) {
  const total = await Attendance.count({ where });
  if (!total) return 0;
  const present = await Attendance.count({
    where: {
      ...where,
      status: { [Op.in]: ['present', 'late'] }
    }
  });
  return Math.round((present / total) * 100);
}

async function averageGrades(where = {}) {
  const result = await Grade.findOne({
    attributes: [[fn('AVG', col('total_score')), 'averageScore']],
    where,
    raw: true
  });
  return Number(Number(result?.averageScore || 0).toFixed(1));
}

async function assignmentCompletion(where = {}) {
  const assignments = await Assignment.findAll({
    where,
    attributes: ['id'],
    raw: true
  });
  const ids = assignments.map((assignment) => assignment.id);
  if (!ids.length) return { submitted: 0, total: 0, percentage: 0 };

  const total = await AssignmentSubmission.count({
    where: { assignmentId: { [Op.in]: ids } }
  });
  const submitted = await AssignmentSubmission.count({
    where: {
      assignmentId: { [Op.in]: ids },
      status: { [Op.in]: ['submitted', 'graded'] }
    }
  });

  return {
    submitted,
    total,
    percentage: total ? Math.round((submitted / total) * 100) : 0
  };
}

async function getAdminAnalytics() {
  const [
    totalStudents,
    totalTeachers,
    totalParents,
    totalClasses,
    activeUsers,
    attendance,
    gradeAverage,
    completion
  ] = await Promise.all([
    Student.count(),
    Teacher.count(),
    Parent.count(),
    SchoolClass.count(),
    User.count({ where: { isActive: true } }),
    attendancePercentage(),
    averageGrades(),
    assignmentCompletion()
  ]);

  const gradeBySubject = await Grade.findAll({
    attributes: ['subjectId', [fn('AVG', col('total_score')), 'averageScore']],
    group: ['subjectId'],
    raw: true
  });

  return {
    totals: {
      students: totalStudents,
      teachers: totalTeachers,
      parents: totalParents,
      classes: totalClasses,
      activeUsers
    },
    attendancePercentage: attendance,
    averageGrade: gradeAverage,
    assignmentCompletion: completion,
    gradeBySubject
  };
}

async function getTeacherAnalytics(user) {
  const teacher = await getTeacherByUserId(user.id);
  const classIds = await getTeacherScopedClassIds(user);
  const whereByClass = classIds.length ? { classId: { [Op.in]: classIds } } : { classId: -1 };
  const [
    assignedSubjects,
    assignedClasses,
    totalStudents,
    assignments,
    attendance,
    gradeAverage,
    completion
  ] = await Promise.all([
    TeacherSubject.count({ where: { teacherId: teacher.id } }),
    TeacherSubject.count({
      where: { teacherId: teacher.id },
      distinct: true,
      col: 'class_id'
    }),
    Student.count({ where: whereByClass }),
    Assignment.count({ where: { teacherId: teacher.id } }),
    attendancePercentage({ teacherId: teacher.id }),
    averageGrades({ teacherId: teacher.id }),
    assignmentCompletion({ teacherId: teacher.id })
  ]);

  return {
    totals: {
      assignedSubjects,
      assignedClasses,
      students: totalStudents,
      assignments
    },
    attendancePercentage: attendance,
    averageGrade: gradeAverage,
    assignmentCompletion: completion
  };
}

module.exports = { getAdminAnalytics, getTeacherAnalytics };
