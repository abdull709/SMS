const sequelize = require('../config/database');

const User = require('./User');
const SchoolClass = require('./SchoolClass');
const Student = require('./Student');
const Parent = require('./Parent');
const Teacher = require('./Teacher');
const Subject = require('./Subject');
const TeacherSubject = require('./TeacherSubject');
const StudentParent = require('./StudentParent');
const Attendance = require('./Attendance');
const Grade = require('./Grade');
const Assignment = require('./Assignment');
const AssignmentSubmission = require('./AssignmentSubmission');
const Announcement = require('./Announcement');
const CalendarEvent = require('./CalendarEvent');
const FeePayment = require('./FeePayment');
const ReportCard = require('./ReportCard');

User.hasOne(Student, { foreignKey: 'userId', as: 'studentProfile', onDelete: 'CASCADE' });
Student.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasOne(Parent, { foreignKey: 'userId', as: 'parentProfile', onDelete: 'CASCADE' });
Parent.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasOne(Teacher, { foreignKey: 'userId', as: 'teacherProfile', onDelete: 'CASCADE' });
Teacher.belongsTo(User, { foreignKey: 'userId', as: 'user' });

SchoolClass.hasMany(Student, { foreignKey: 'classId', as: 'students' });
Student.belongsTo(SchoolClass, { foreignKey: 'classId', as: 'class' });

SchoolClass.belongsTo(Teacher, { foreignKey: 'classTeacherId', as: 'classTeacher' });
Teacher.hasMany(SchoolClass, { foreignKey: 'classTeacherId', as: 'managedClasses' });

Student.belongsToMany(Parent, {
  through: StudentParent,
  foreignKey: 'studentId',
  otherKey: 'parentId',
  as: 'parents'
});
Parent.belongsToMany(Student, {
  through: StudentParent,
  foreignKey: 'parentId',
  otherKey: 'studentId',
  as: 'children'
});
StudentParent.belongsTo(Student, { foreignKey: 'studentId', as: 'student' });
StudentParent.belongsTo(Parent, { foreignKey: 'parentId', as: 'parent' });

Teacher.belongsToMany(Subject, {
  through: TeacherSubject,
  foreignKey: 'teacherId',
  otherKey: 'subjectId',
  as: 'subjects'
});
Subject.belongsToMany(Teacher, {
  through: TeacherSubject,
  foreignKey: 'subjectId',
  otherKey: 'teacherId',
  as: 'teachers'
});
Teacher.belongsToMany(SchoolClass, {
  through: TeacherSubject,
  foreignKey: 'teacherId',
  otherKey: 'classId',
  as: 'classes'
});
SchoolClass.belongsToMany(Teacher, {
  through: TeacherSubject,
  foreignKey: 'classId',
  otherKey: 'teacherId',
  as: 'teachers'
});
TeacherSubject.belongsTo(Teacher, { foreignKey: 'teacherId', as: 'teacher' });
TeacherSubject.belongsTo(Subject, { foreignKey: 'subjectId', as: 'subject' });
TeacherSubject.belongsTo(SchoolClass, { foreignKey: 'classId', as: 'class' });

Attendance.belongsTo(Student, { foreignKey: 'studentId', as: 'student' });
Attendance.belongsTo(SchoolClass, { foreignKey: 'classId', as: 'class' });
Attendance.belongsTo(Teacher, { foreignKey: 'teacherId', as: 'teacher' });
Student.hasMany(Attendance, { foreignKey: 'studentId', as: 'attendanceRecords' });

Grade.belongsTo(Student, { foreignKey: 'studentId', as: 'student' });
Grade.belongsTo(Subject, { foreignKey: 'subjectId', as: 'subject' });
Grade.belongsTo(SchoolClass, { foreignKey: 'classId', as: 'class' });
Grade.belongsTo(Teacher, { foreignKey: 'teacherId', as: 'teacher' });
Student.hasMany(Grade, { foreignKey: 'studentId', as: 'grades' });

Assignment.belongsTo(Teacher, { foreignKey: 'teacherId', as: 'teacher' });
Assignment.belongsTo(Subject, { foreignKey: 'subjectId', as: 'subject' });
Assignment.belongsTo(SchoolClass, { foreignKey: 'classId', as: 'class' });
Assignment.hasMany(AssignmentSubmission, { foreignKey: 'assignmentId', as: 'submissions', onDelete: 'CASCADE' });
AssignmentSubmission.belongsTo(Assignment, { foreignKey: 'assignmentId', as: 'assignment' });
AssignmentSubmission.belongsTo(Student, { foreignKey: 'studentId', as: 'student' });

Announcement.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });
CalendarEvent.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });

FeePayment.belongsTo(Student, { foreignKey: 'studentId', as: 'student' });
Student.hasMany(FeePayment, { foreignKey: 'studentId', as: 'feePayments' });

ReportCard.belongsTo(Student, { foreignKey: 'studentId', as: 'student' });
ReportCard.belongsTo(SchoolClass, { foreignKey: 'classId', as: 'class' });
ReportCard.belongsTo(User, { foreignKey: 'generatedBy', as: 'generator' });
Student.hasMany(ReportCard, { foreignKey: 'studentId', as: 'reportCards' });

module.exports = {
  sequelize,
  User,
  SchoolClass,
  Student,
  Parent,
  Teacher,
  Subject,
  TeacherSubject,
  StudentParent,
  Attendance,
  Grade,
  Assignment,
  AssignmentSubmission,
  Announcement,
  CalendarEvent,
  FeePayment,
  ReportCard
};
