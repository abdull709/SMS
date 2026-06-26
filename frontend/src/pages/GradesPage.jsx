import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { api } from '../lib/api.js';
import { fullName } from '../lib/format.js';
import { useAuth } from '../context/AuthContext.jsx';
import { PageHeader } from '../components/layout/PageHeader.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Card, CardHeader } from '../components/ui/Card.jsx';
import { DataTable } from '../components/ui/DataTable.jsx';
import { FormField, inputClass } from '../components/ui/FormField.jsx';
import { Badge } from '../components/ui/Badge.jsx';

const terms = ['First Term', 'Second Term', 'Third Term'];

function gradeTone(grade) {
  if (grade === 'A') return 'green';
  if (grade === 'B' || grade === 'C') return 'blue';
  if (grade === 'D' || grade === 'E') return 'amber';
  return 'rose';
}

export function GradesPage() {
  const { user } = useAuth();
  const canWrite = ['admin', 'teacher'].includes(user.role);
  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState(null);
  const [page, setPage] = useState(1);
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    studentId: '',
    subjectId: '',
    classId: '',
    teacherId: '',
    term: 'Third Term',
    session: '2025/2026',
    assessmentScore: '',
    examScore: ''
  });

  async function load(nextPage = page) {
    setLoading(true);
    try {
      const [grades, studentData, subjectData, teacherData] = await Promise.all([
        api.get('/api/grades', { page: nextPage, limit: 10 }),
        api.get('/api/students', { limit: 100 }),
        api.get('/api/subjects', { limit: 100 }),
        user.role === 'admin' ? api.get('/api/teachers', { limit: 100 }) : Promise.resolve({ data: [] })
      ]);
      setRows(grades.data || []);
      setMeta(grades.meta);
      setStudents(studentData.data || []);
      setSubjects(subjectData.data || []);
      setTeachers(teacherData.data || []);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load(1);
  }, []);

  function setStudent(studentId) {
    const student = students.find((item) => String(item.id) === String(studentId));
    setForm({ ...form, studentId, classId: student?.classId || '' });
  }

  async function save(event) {
    event.preventDefault();
    try {
      await api.post('/api/grades', {
        ...form,
        studentId: Number(form.studentId),
        subjectId: Number(form.subjectId),
        classId: Number(form.classId),
        teacherId: form.teacherId ? Number(form.teacherId) : undefined,
        assessmentScore: Number(form.assessmentScore),
        examScore: Number(form.examScore)
      });
      toast.success('Grade saved');
      setForm({ ...form, assessmentScore: '', examScore: '' });
      load(page);
    } catch (error) {
      toast.error(error.message);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Grades" description="Enter assessment and exam scores, then review student results." />

      {canWrite ? (
        <Card>
          <CardHeader title="Enter Grade" description="Assessment is capped at 40 and exam score at 60." />
          <form className="grid gap-4 p-5 lg:grid-cols-4" onSubmit={save}>
            <FormField label="Student">
              <select className={inputClass()} value={form.studentId} onChange={(event) => setStudent(event.target.value)} required>
                <option value="">Select student</option>
                {students.map((student) => <option key={student.id} value={student.id}>{fullName(student.user)} · {student.class?.name}</option>)}
              </select>
            </FormField>
            <FormField label="Subject">
              <select className={inputClass()} value={form.subjectId} onChange={(event) => setForm({ ...form, subjectId: event.target.value })} required>
                <option value="">Select subject</option>
                {subjects.map((subject) => <option key={subject.id} value={subject.id}>{subject.name}</option>)}
              </select>
            </FormField>
            {user.role === 'admin' ? (
              <FormField label="Teacher">
                <select className={inputClass()} value={form.teacherId} onChange={(event) => setForm({ ...form, teacherId: event.target.value })} required>
                  <option value="">Select teacher</option>
                  {teachers.map((teacher) => <option key={teacher.id} value={teacher.id}>{fullName(teacher.user)}</option>)}
                </select>
              </FormField>
            ) : null}
            <FormField label="Term">
              <select className={inputClass()} value={form.term} onChange={(event) => setForm({ ...form, term: event.target.value })}>
                {terms.map((term) => <option key={term} value={term}>{term}</option>)}
              </select>
            </FormField>
            <FormField label="Session">
              <input className={inputClass()} value={form.session} onChange={(event) => setForm({ ...form, session: event.target.value })} required />
            </FormField>
            <FormField label="Assessment">
              <input className={inputClass()} type="number" min="0" max="40" value={form.assessmentScore} onChange={(event) => setForm({ ...form, assessmentScore: event.target.value })} required />
            </FormField>
            <FormField label="Exam">
              <input className={inputClass()} type="number" min="0" max="60" value={form.examScore} onChange={(event) => setForm({ ...form, examScore: event.target.value })} required />
            </FormField>
            <div className="flex items-end">
              <Button type="submit" className="w-full">Save Grade</Button>
            </div>
          </form>
        </Card>
      ) : null}

      <Card>
        <CardHeader title="Results" description={`${meta?.total ?? rows.length} records`} />
        <DataTable
          columns={[
            { key: 'student', label: 'Student', render: (row) => fullName(row.student?.user) },
            { key: 'subject', label: 'Subject', render: (row) => row.subject?.name },
            { key: 'term', label: 'Term' },
            { key: 'totalScore', label: 'Total', render: (row) => Number(row.totalScore).toFixed(1) },
            { key: 'grade', label: 'Grade', render: (row) => <Badge tone={gradeTone(row.grade)}>{row.grade}</Badge> },
            { key: 'remarks', label: 'Remarks' }
          ]}
          rows={rows}
          loading={loading}
          meta={meta}
          onPage={(nextPage) => {
            setPage(nextPage);
            load(nextPage);
          }}
        />
      </Card>
    </div>
  );
}
