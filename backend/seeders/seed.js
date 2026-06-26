const bcrypt = require('bcryptjs');
const {
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
  FeePayment
} = require('../models');
const { calculateGrade } = require('../utils/grade');

const password = 'Password123!';

async function createUser(firstName, lastName, email, role, phone = null) {
  return User.create({
    firstName,
    lastName,
    email,
    role,
    phone,
    password: await bcrypt.hash(password, 12)
  });
}

async function seed() {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ alter: true });

    const userCount = await User.count();
    if (userCount > 0) {
      console.log('Seed skipped because users already exist.');
      return;
    }

    const adminUser = await createUser('Amina', 'Okafor', 'admin@smartschool.test', 'admin', '+2348000000001');

    const classRows = await SchoolClass.bulkCreate([
      { name: 'Nursery 2 Blue', level: 'nursery', section: 'Blue', academicSession: '2025/2026' },
      { name: 'Primary 4 Gold', level: 'primary', section: 'Gold', academicSession: '2025/2026' },
      { name: 'JSS 2 Sapphire', level: 'secondary', section: 'Sapphire', academicSession: '2025/2026' }
    ], { returning: true });

    const nurseryClass = classRows[0];
    const primaryClass = classRows[1];
    const secondaryClass = classRows[2];

    const subjects = await Subject.bulkCreate([
      { name: 'Mathematics', code: 'MATH', level: 'all' },
      { name: 'English Language', code: 'ENG', level: 'all' },
      { name: 'Basic Science', code: 'BSCI', level: 'primary' },
      { name: 'Computer Studies', code: 'COMP', level: 'all' },
      { name: 'Civic Education', code: 'CIV', level: 'secondary' }
    ], { returning: true });

    const [math, english, science, computer, civic] = subjects;

    const teacherUsers = await Promise.all([
      createUser('Grace', 'Adeyemi', 'grace.teacher@smartschool.test', 'teacher', '+2348000000101'),
      createUser('David', 'Mensah', 'david.teacher@smartschool.test', 'teacher', '+2348000000102'),
      createUser('Zainab', 'Bello', 'zainab.teacher@smartschool.test', 'teacher', '+2348000000103')
    ]);

    const teachers = await Teacher.bulkCreate([
      { userId: teacherUsers[0].id, employeeNumber: 'TCH-001', qualification: 'B.Ed Early Childhood Education', specialization: 'Nursery Literacy' },
      { userId: teacherUsers[1].id, employeeNumber: 'TCH-002', qualification: 'B.Sc Mathematics Education', specialization: 'Mathematics' },
      { userId: teacherUsers[2].id, employeeNumber: 'TCH-003', qualification: 'B.Sc Computer Science', specialization: 'Computer Studies' }
    ], { returning: true });

    await nurseryClass.update({ classTeacherId: teachers[0].id });
    await primaryClass.update({ classTeacherId: teachers[1].id });
    await secondaryClass.update({ classTeacherId: teachers[2].id });

    await TeacherSubject.bulkCreate([
      { teacherId: teachers[0].id, classId: nurseryClass.id, subjectId: english.id },
      { teacherId: teachers[0].id, classId: nurseryClass.id, subjectId: math.id },
      { teacherId: teachers[1].id, classId: primaryClass.id, subjectId: math.id },
      { teacherId: teachers[1].id, classId: primaryClass.id, subjectId: science.id },
      { teacherId: teachers[2].id, classId: secondaryClass.id, subjectId: computer.id },
      { teacherId: teachers[2].id, classId: secondaryClass.id, subjectId: civic.id },
      { teacherId: teachers[2].id, classId: secondaryClass.id, subjectId: math.id }
    ]);

    const parentUsers = await Promise.all([
      createUser('Chinedu', 'Nwosu', 'chinedu.parent@smartschool.test', 'parent', '+2348000000201'),
      createUser('Mariam', 'Sule', 'mariam.parent@smartschool.test', 'parent', '+2348000000202'),
      createUser('Kemi', 'Johnson', 'kemi.parent@smartschool.test', 'parent', '+2348000000203')
    ]);

    const parents = await Parent.bulkCreate([
      { userId: parentUsers[0].id, occupation: 'Civil Engineer', address: '12 Unity Crescent, Lagos' },
      { userId: parentUsers[1].id, occupation: 'Pharmacist', address: '8 Palm Avenue, Abuja' },
      { userId: parentUsers[2].id, occupation: 'Business Owner', address: '4 School Road, Ibadan' }
    ], { returning: true });

    const studentUsers = await Promise.all([
      createUser('Ada', 'Nwosu', 'ada.student@smartschool.test', 'student', null),
      createUser('Tobi', 'Johnson', 'tobi.student@smartschool.test', 'student', null),
      createUser('Farida', 'Sule', 'farida.student@smartschool.test', 'student', null),
      createUser('Emeka', 'Nwosu', 'emeka.student@smartschool.test', 'student', null),
      createUser('Lara', 'Johnson', 'lara.student@smartschool.test', 'student', null)
    ]);

    const students = await Student.bulkCreate([
      { userId: studentUsers[0].id, classId: primaryClass.id, admissionNumber: 'SMS/2026/001', dateOfBirth: '2016-04-12', gender: 'female', address: '12 Unity Crescent, Lagos' },
      { userId: studentUsers[1].id, classId: nurseryClass.id, admissionNumber: 'SMS/2026/002', dateOfBirth: '2021-09-05', gender: 'male', address: '4 School Road, Ibadan' },
      { userId: studentUsers[2].id, classId: secondaryClass.id, admissionNumber: 'SMS/2026/003', dateOfBirth: '2012-01-22', gender: 'female', address: '8 Palm Avenue, Abuja' },
      { userId: studentUsers[3].id, classId: secondaryClass.id, admissionNumber: 'SMS/2026/004', dateOfBirth: '2011-11-16', gender: 'male', address: '12 Unity Crescent, Lagos' },
      { userId: studentUsers[4].id, classId: primaryClass.id, admissionNumber: 'SMS/2026/005', dateOfBirth: '2016-07-30', gender: 'female', address: '4 School Road, Ibadan' }
    ], { returning: true });

    await StudentParent.bulkCreate([
      { studentId: students[0].id, parentId: parents[0].id, relationship: 'Father', isPrimary: true },
      { studentId: students[3].id, parentId: parents[0].id, relationship: 'Father', isPrimary: true },
      { studentId: students[2].id, parentId: parents[1].id, relationship: 'Mother', isPrimary: true },
      { studentId: students[1].id, parentId: parents[2].id, relationship: 'Mother', isPrimary: true },
      { studentId: students[4].id, parentId: parents[2].id, relationship: 'Mother', isPrimary: true }
    ]);

    const attendanceDays = ['2026-06-15', '2026-06-16', '2026-06-17', '2026-06-18', '2026-06-19'];
    const attendanceRows = [];
    for (const date of attendanceDays) {
      for (const student of students) {
        const teacher = student.classId === nurseryClass.id ? teachers[0] : student.classId === primaryClass.id ? teachers[1] : teachers[2];
        attendanceRows.push({
          studentId: student.id,
          classId: student.classId,
          teacherId: teacher.id,
          date,
          status: date === '2026-06-18' && student.id === students[2].id ? 'absent' : 'present',
          remarks: null
        });
      }
    }
    await Attendance.bulkCreate(attendanceRows);

    const gradeRows = [
      [students[0], math, primaryClass, teachers[1], 32, 48],
      [students[0], english, primaryClass, teachers[0], 30, 45],
      [students[0], science, primaryClass, teachers[1], 28, 44],
      [students[1], math, nurseryClass, teachers[0], 35, 50],
      [students[1], english, nurseryClass, teachers[0], 34, 49],
      [students[2], computer, secondaryClass, teachers[2], 31, 52],
      [students[2], civic, secondaryClass, teachers[2], 27, 43],
      [students[3], math, secondaryClass, teachers[2], 25, 39],
      [students[3], computer, secondaryClass, teachers[2], 29, 47],
      [students[4], math, primaryClass, teachers[1], 33, 50],
      [students[4], science, primaryClass, teachers[1], 30, 46]
    ].map(([student, subject, schoolClass, teacher, assessmentScore, examScore]) => {
      const calculated = calculateGrade(assessmentScore, examScore);
      return {
        studentId: student.id,
        subjectId: subject.id,
        classId: schoolClass.id,
        teacherId: teacher.id,
        term: 'Third Term',
        session: '2025/2026',
        assessmentScore,
        examScore,
        totalScore: calculated.totalScore,
        grade: calculated.grade,
        remarks: calculated.remarks
      };
    });
    await Grade.bulkCreate(gradeRows);

    const assignments = await Assignment.bulkCreate([
      { title: 'Fractions Practice', description: 'Complete exercises 1 to 20 on equivalent fractions.', teacherId: teachers[1].id, subjectId: math.id, classId: primaryClass.id, dueDate: '2026-06-30', totalMarks: 20, status: 'published' },
      { title: 'My Community Essay', description: 'Write two pages about a helpful person in your community.', teacherId: teachers[0].id, subjectId: english.id, classId: nurseryClass.id, dueDate: '2026-06-28', totalMarks: 10, status: 'published' },
      { title: 'Spreadsheet Budget', description: 'Create a simple monthly budget spreadsheet.', teacherId: teachers[2].id, subjectId: computer.id, classId: secondaryClass.id, dueDate: '2026-07-03', totalMarks: 30, status: 'published' }
    ], { returning: true });

    const submissionRows = [];
    for (const assignment of assignments) {
      const classStudents = students.filter((student) => student.classId === assignment.classId);
      classStudents.forEach((student, index) => {
        submissionRows.push({
          assignmentId: assignment.id,
          studentId: student.id,
          status: index === 0 ? 'submitted' : 'pending',
          submittedAt: index === 0 ? new Date('2026-06-21T10:00:00Z') : null
        });
      });
    }
    await AssignmentSubmission.bulkCreate(submissionRows);

    await Announcement.bulkCreate([
      { title: 'Third Term Revision Week', body: 'Revision classes begin next Monday. Students should come with completed notebooks.', createdBy: adminUser.id, visibleTo: ['all'], status: 'published' },
      { title: 'PTA Meeting', body: 'Parents and guardians are invited to the PTA meeting in the multipurpose hall.', createdBy: adminUser.id, visibleTo: ['parent'], status: 'published' },
      { title: 'Teacher Record Update', body: 'Teachers should update attendance and grade records before Friday.', createdBy: adminUser.id, visibleTo: ['teacher'], status: 'published' }
    ]);

    await CalendarEvent.bulkCreate([
      { title: 'Revision Week Begins', description: 'Focused revision across all classes.', startDate: '2026-06-29', endDate: '2026-07-03', type: 'academic', createdBy: adminUser.id, visibleTo: ['all'] },
      { title: 'Third Term Exams', description: 'End-of-term exams for primary and secondary classes.', startDate: '2026-07-13', endDate: '2026-07-24', type: 'exam', createdBy: adminUser.id, visibleTo: ['teacher', 'student', 'parent'] },
      { title: 'PTA Meeting', description: 'Parent-teacher discussion and fee review.', startDate: '2026-07-04', endDate: null, type: 'meeting', createdBy: adminUser.id, visibleTo: ['parent', 'teacher'] }
    ]);

    await FeePayment.bulkCreate([
      { studentId: students[0].id, term: 'Third Term', session: '2025/2026', amountDue: 120000, amountPaid: 120000, dueDate: '2026-06-30', status: 'paid' },
      { studentId: students[1].id, term: 'Third Term', session: '2025/2026', amountDue: 95000, amountPaid: 70000, dueDate: '2026-06-30', status: 'partial' },
      { studentId: students[2].id, term: 'Third Term', session: '2025/2026', amountDue: 150000, amountPaid: 0, dueDate: '2026-06-30', status: 'unpaid' }
    ]);

    console.log('Seed completed successfully.');
    console.log(`Demo password for all users: ${password}`);
  } catch (error) {
    console.error('Seed failed:', error);
    process.exitCode = 1;
  } finally {
    await sequelize.close();
  }
}

seed();
