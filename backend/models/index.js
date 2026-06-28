const sequelize = require('../config/database');

const School = require('./School');
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

School.hasMany(User, { foreignKey: 'schoolId', as: 'users' });
User.belongsTo(School, { foreignKey: 'schoolId', as: 'school' });

School.hasMany(SchoolClass, { foreignKey: 'schoolId', as: 'classes' });
SchoolClass.belongsTo(School, { foreignKey: 'schoolId', as: 'school' });

School.hasMany(Subject, { foreignKey: 'schoolId', as: 'subjects' });
Subject.belongsTo(School, { foreignKey: 'schoolId', as: 'school' });

User.hasOne(Student, { foreignKey: 'userId', as: 'studentProfile', onDelete: 'CASCADE' });
Student.belongsTo(User, { foreignKey: 'userId', as: 'user' });
School.hasMany(Student, { foreignKey: 'schoolId', as: 'students' });
Student.belongsTo(School, { foreignKey: 'schoolId', as: 'school' });

User.hasOne(Parent, { foreignKey: 'userId', as: 'parentProfile', onDelete: 'CASCADE' });
Parent.belongsTo(User, { foreignKey: 'userId', as: 'user' });
School.hasMany(Parent, { foreignKey: 'schoolId', as: 'parents' });
Parent.belongsTo(School, { foreignKey: 'schoolId', as: 'school' });

User.hasOne(Teacher, { foreignKey: 'userId', as: 'teacherProfile', onDelete: 'CASCADE' });
Teacher.belongsTo(User, { foreignKey: 'userId', as: 'user' });
School.hasMany(Teacher, { foreignKey: 'schoolId', as: 'teachers' });
Teacher.belongsTo(School, { foreignKey: 'schoolId', as: 'school' });

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
School.hasMany(StudentParent, { foreignKey: 'schoolId', as: 'studentParentLinks' });
StudentParent.belongsTo(School, { foreignKey: 'schoolId', as: 'school' });

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
School.hasMany(TeacherSubject, { foreignKey: 'schoolId', as: 'teacherAssignments' });
TeacherSubject.belongsTo(School, { foreignKey: 'schoolId', as: 'school' });

Attendance.belongsTo(Student, { foreignKey: 'studentId', as: 'student' });
Attendance.belongsTo(SchoolClass, { foreignKey: 'classId', as: 'class' });
Attendance.belongsTo(Teacher, { foreignKey: 'teacherId', as: 'teacher' });
Student.hasMany(Attendance, { foreignKey: 'studentId', as: 'attendanceRecords' });
School.hasMany(Attendance, { foreignKey: 'schoolId', as: 'attendanceRecords' });
Attendance.belongsTo(School, { foreignKey: 'schoolId', as: 'school' });

Grade.belongsTo(Student, { foreignKey: 'studentId', as: 'student' });
Grade.belongsTo(Subject, { foreignKey: 'subjectId', as: 'subject' });
Grade.belongsTo(SchoolClass, { foreignKey: 'classId', as: 'class' });
Grade.belongsTo(Teacher, { foreignKey: 'teacherId', as: 'teacher' });
Student.hasMany(Grade, { foreignKey: 'studentId', as: 'grades' });
School.hasMany(Grade, { foreignKey: 'schoolId', as: 'grades' });
Grade.belongsTo(School, { foreignKey: 'schoolId', as: 'school' });

Assignment.belongsTo(Teacher, { foreignKey: 'teacherId', as: 'teacher' });
Assignment.belongsTo(Subject, { foreignKey: 'subjectId', as: 'subject' });
Assignment.belongsTo(SchoolClass, { foreignKey: 'classId', as: 'class' });
Assignment.hasMany(AssignmentSubmission, { foreignKey: 'assignmentId', as: 'submissions', onDelete: 'CASCADE' });
AssignmentSubmission.belongsTo(Assignment, { foreignKey: 'assignmentId', as: 'assignment' });
AssignmentSubmission.belongsTo(Student, { foreignKey: 'studentId', as: 'student' });
School.hasMany(Assignment, { foreignKey: 'schoolId', as: 'assignments' });
Assignment.belongsTo(School, { foreignKey: 'schoolId', as: 'school' });
School.hasMany(AssignmentSubmission, { foreignKey: 'schoolId', as: 'assignmentSubmissions' });
AssignmentSubmission.belongsTo(School, { foreignKey: 'schoolId', as: 'school' });

Announcement.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });
CalendarEvent.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });
School.hasMany(Announcement, { foreignKey: 'schoolId', as: 'announcements' });
Announcement.belongsTo(School, { foreignKey: 'schoolId', as: 'school' });
School.hasMany(CalendarEvent, { foreignKey: 'schoolId', as: 'calendarEvents' });
CalendarEvent.belongsTo(School, { foreignKey: 'schoolId', as: 'school' });

FeePayment.belongsTo(Student, { foreignKey: 'studentId', as: 'student' });
Student.hasMany(FeePayment, { foreignKey: 'studentId', as: 'feePayments' });
School.hasMany(FeePayment, { foreignKey: 'schoolId', as: 'feePayments' });
FeePayment.belongsTo(School, { foreignKey: 'schoolId', as: 'school' });

ReportCard.belongsTo(Student, { foreignKey: 'studentId', as: 'student' });
ReportCard.belongsTo(SchoolClass, { foreignKey: 'classId', as: 'class' });
ReportCard.belongsTo(User, { foreignKey: 'generatedBy', as: 'generator' });
Student.hasMany(ReportCard, { foreignKey: 'studentId', as: 'reportCards' });
School.hasMany(ReportCard, { foreignKey: 'schoolId', as: 'reportCards' });
ReportCard.belongsTo(School, { foreignKey: 'schoolId', as: 'school' });

module.exports = {
  sequelize,
  School,
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
