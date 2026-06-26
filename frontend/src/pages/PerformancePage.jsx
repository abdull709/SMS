import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { api } from '../lib/api.js';
import { fullName } from '../lib/format.js';
import { PageHeader } from '../components/layout/PageHeader.jsx';
import { Card, CardHeader } from '../components/ui/Card.jsx';
import { DataTable } from '../components/ui/DataTable.jsx';
import { Loader } from '../components/ui/Loader.jsx';

export function PerformancePage() {
  const [students, setStudents] = useState([]);
  const [grades, setGrades] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [studentData, gradeData, attendanceData] = await Promise.all([
          api.get('/api/students', { limit: 100 }),
          api.get('/api/grades', { limit: 100 }),
          api.get('/api/attendance', { limit: 100 })
        ]);
        setStudents(studentData.data || []);
        setGrades(gradeData.data || []);
        setAttendance(attendanceData.data || []);
      } catch (error) {
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const rows = useMemo(() => students.map((student) => {
    const studentGrades = grades.filter((grade) => grade.studentId === student.id);
    const average = studentGrades.length
      ? Math.round(studentGrades.reduce((sum, grade) => sum + Number(grade.totalScore || 0), 0) / studentGrades.length)
      : 0;
    const attendanceRows = attendance.filter((item) => item.studentId === student.id);
    const present = attendanceRows.filter((item) => ['present', 'late'].includes(item.status)).length;
    const attendancePercentage = attendanceRows.length ? Math.round((present / attendanceRows.length) * 100) : 0;
    return {
      id: student.id,
      student,
      average,
      attendancePercentage,
      className: student.class?.name
    };
  }), [students, grades, attendance]);

  if (loading) return <Loader label="Loading performance" />;

  return (
    <div className="space-y-6">
      <PageHeader title="Student Performance" description="Performance summary for assigned classes and subjects." />
      <Card>
        <CardHeader title="Average Scores" description="Grade averages by student." />
        <div className="h-80 p-5">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={rows}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey={(row) => fullName(row.student.user).split(' ')[0]} />
              <YAxis domain={[0, 100]} />
              <Tooltip labelFormatter={(_, payload) => fullName(payload?.[0]?.payload?.student?.user)} />
              <Bar dataKey="average" fill="#2563eb" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
      <Card>
        <CardHeader title="Student Summary" description={`${rows.length} students`} />
        <DataTable
          columns={[
            { key: 'student', label: 'Student', render: (row) => fullName(row.student.user) },
            { key: 'className', label: 'Class' },
            { key: 'average', label: 'Average', render: (row) => `${row.average}%` },
            { key: 'attendancePercentage', label: 'Attendance', render: (row) => `${row.attendancePercentage}%` }
          ]}
          rows={rows}
          loading={false}
        />
      </Card>
    </div>
  );
}
