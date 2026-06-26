import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { api } from '../lib/api.js';
import { formatDate, fullName } from '../lib/format.js';
import { useAuth } from '../context/AuthContext.jsx';
import { PageHeader } from '../components/layout/PageHeader.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Card, CardHeader } from '../components/ui/Card.jsx';
import { DataTable } from '../components/ui/DataTable.jsx';
import { FormField, inputClass } from '../components/ui/FormField.jsx';
import { Badge } from '../components/ui/Badge.jsx';

const statuses = ['present', 'absent', 'late', 'excused'];

function statusTone(status) {
  if (status === 'present') return 'green';
  if (status === 'late') return 'amber';
  if (status === 'absent') return 'rose';
  return 'slate';
}

export function AttendancePage() {
  const { user } = useAuth();
  const canWrite = ['admin', 'teacher'].includes(user.role);
  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState(null);
  const [page, setPage] = useState(1);
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [form, setForm] = useState({
    classId: '',
    teacherId: '',
    date: new Date().toISOString().slice(0, 10),
    records: {}
  });
  const [loading, setLoading] = useState(true);

  const classStudents = useMemo(() => students.filter((student) => String(student.classId) === String(form.classId)), [students, form.classId]);

  async function load(nextPage = page) {
    setLoading(true);
    try {
      const [attendance, classData, studentData, teacherData] = await Promise.all([
        api.get('/api/attendance', { page: nextPage, limit: 10 }),
        api.get('/api/classes', { limit: 100 }),
        api.get('/api/students', { limit: 100 }),
        user.role === 'admin' ? api.get('/api/teachers', { limit: 100 }) : Promise.resolve({ data: [] })
      ]);
      setRows(attendance.data || []);
      setMeta(attendance.meta);
      setClasses(classData.data || []);
      setStudents(studentData.data || []);
      setTeachers(teacherData.data || []);
      if (!form.classId && classData.data?.[0]) {
        setForm((current) => ({ ...current, classId: classData.data[0].id }));
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load(1);
  }, []);

  function setRecord(studentId, status) {
    setForm((current) => ({
      ...current,
      records: { ...current.records, [studentId]: status }
    }));
  }

  async function mark(event) {
    event.preventDefault();
    const records = classStudents.map((student) => ({
      studentId: student.id,
      status: form.records[student.id] || 'present'
    }));
    if (!records.length) {
      toast.error('No students found for this class');
      return;
    }

    try {
      await api.post('/api/attendance', {
        classId: Number(form.classId),
        teacherId: form.teacherId ? Number(form.teacherId) : undefined,
        date: form.date,
        records
      });
      toast.success('Attendance saved');
      setForm((current) => ({ ...current, records: {} }));
      load(page);
    } catch (error) {
      toast.error(error.message);
    }
  }

  async function updateStatus(row, status) {
    try {
      await api.put(`/api/attendance/${row.id}`, { status });
      toast.success('Attendance updated');
      load(page);
    } catch (error) {
      toast.error(error.message);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Attendance" description="Daily attendance records and attendance percentage inputs." />

      {canWrite ? (
        <Card>
          <CardHeader title="Mark Attendance" description="Select a class and date, then record each student status." />
          <form className="grid gap-4 p-5 lg:grid-cols-4" onSubmit={mark}>
            <FormField label="Class">
              <select className={inputClass()} value={form.classId} onChange={(event) => setForm({ ...form, classId: event.target.value, records: {} })} required>
                <option value="">Select class</option>
                {classes.map((schoolClass) => <option key={schoolClass.id} value={schoolClass.id}>{schoolClass.name}</option>)}
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
            <FormField label="Date">
              <input className={inputClass()} type="date" value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} required />
            </FormField>
            <div className="flex items-end">
              <Button type="submit" className="w-full">Save Attendance</Button>
            </div>
            <div className="grid gap-3 lg:col-span-4">
              {classStudents.map((student) => (
                <div key={student.id} className="grid gap-3 rounded-lg border border-slate-100 p-3 sm:grid-cols-[1fr_180px] sm:items-center">
                  <div>
                    <p className="font-semibold text-ink">{fullName(student.user)}</p>
                    <p className="text-sm text-slate-500">{student.admissionNumber}</p>
                  </div>
                  <select className={inputClass()} value={form.records[student.id] || 'present'} onChange={(event) => setRecord(student.id, event.target.value)}>
                    {statuses.map((status) => <option key={status} value={status}>{status}</option>)}
                  </select>
                </div>
              ))}
            </div>
          </form>
        </Card>
      ) : null}

      <Card>
        <CardHeader title="Attendance Records" description={`${meta?.total ?? rows.length} records`} />
        <DataTable
          columns={[
            { key: 'student', label: 'Student', render: (row) => fullName(row.student?.user) },
            { key: 'class', label: 'Class', render: (row) => row.class?.name },
            { key: 'date', label: 'Date', render: (row) => formatDate(row.date) },
            { key: 'status', label: 'Status', render: (row) => <Badge tone={statusTone(row.status)}>{row.status}</Badge> },
            { key: 'teacher', label: 'Teacher', render: (row) => fullName(row.teacher?.user) }
          ]}
          rows={rows}
          loading={loading}
          meta={meta}
          onPage={(nextPage) => {
            setPage(nextPage);
            load(nextPage);
          }}
          actions={canWrite ? (row) => (
            <select
              className="focus-ring h-10 rounded-lg border border-slate-200 bg-white px-2 text-sm"
              value={row.status}
              onChange={(event) => updateStatus(row, event.target.value)}
            >
              {statuses.map((status) => <option key={status} value={status}>{status}</option>)}
            </select>
          ) : null}
        />
      </Card>
    </div>
  );
}
