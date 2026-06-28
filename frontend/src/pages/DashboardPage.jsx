import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { BookOpen, ClipboardCheck, FileText, GraduationCap, School, Users, UserRoundCheck } from 'lucide-react';
import { api } from '../lib/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { PageHeader } from '../components/layout/PageHeader.jsx';
import { Card, CardHeader } from '../components/ui/Card.jsx';
import { Loader } from '../components/ui/Loader.jsx';
import { StatCard } from '../components/ui/StatCard.jsx';
import { Badge } from '../components/ui/Badge.jsx';
import { formatDate, fullName } from '../lib/format.js';

function AdminTeacherDashboard({ role }) {
  const [analytics, setAnalytics] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [summary, notices, calendar] = await Promise.all([
          api.get('/api/analytics/summary'),
          api.get('/api/announcements', { limit: 5 }),
          api.get('/api/calendar-events', { limit: 5 })
        ]);
        setAnalytics(summary);
        setAnnouncements(notices.data || []);
        setEvents(calendar.data || []);
      } catch (error) {
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <Loader label="Loading dashboard" />;

  const chartData = [
    { name: 'Attendance', value: analytics.attendancePercentage },
    { name: 'Grades', value: analytics.averageGrade },
    { name: 'Assignments', value: analytics.assignmentCompletion?.percentage || 0 }
  ];

  const totals = analytics.totals || {};
  const cards = role === 'admin'
    ? [
      ['Students', totals.students, GraduationCap, 'blue'],
      ['Teachers', totals.teachers, UserRoundCheck, 'green'],
      ['Parents', totals.parents, Users, 'amber'],
      ['Classes', totals.classes, School, 'rose']
    ]
    : [
      ['Assigned Classes', totals.assignedClasses, School, 'blue'],
      ['Assigned Subjects', totals.assignedSubjects, BookOpen, 'green'],
      ['Students', totals.students, GraduationCap, 'amber'],
      ['Assignments', totals.assignments, FileText, 'rose']
    ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(([label, value, Icon, tone]) => (
          <StatCard key={label} label={label} value={value ?? 0} icon={Icon} tone={tone} />
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <Card>
          <CardHeader title="Academic Health" description="Attendance, grade, and assignment completion percentages." />
          <div className="h-80 p-5">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Bar dataKey="value" fill="#2563eb" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <CardHeader title="School Feed" description="Latest announcements and upcoming dates." />
          <div className="space-y-4 p-5">
            {announcements.map((item) => (
              <div key={item.id} className="rounded-lg border border-slate-100 p-3">
                <div className="flex items-start justify-between gap-3">
                  <p className="font-semibold text-ink">{item.title}</p>
                  <Badge tone={item.status === 'published' ? 'green' : 'amber'}>{item.status}</Badge>
                </div>
                <p className="mt-1 line-clamp-2 text-sm text-slate-500">{item.body}</p>
              </div>
            ))}
            {events.map((event) => (
              <div key={`event-${event.id}`} className="rounded-lg bg-slate-50 p-3">
                <p className="text-sm font-semibold text-ink">{event.title}</p>
                <p className="text-xs text-slate-500">{formatDate(event.startDate)}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

function StudentParentDashboard({ role }) {
  const [data, setData] = useState({ students: [], attendance: [], grades: [], assignments: [], fees: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [students, attendance, grades, assignments, fees] = await Promise.all([
          api.get('/api/students', { limit: 20 }),
          api.get('/api/attendance', { limit: 100 }),
          api.get('/api/grades', { limit: 100 }),
          api.get('/api/assignments', { limit: 20 }),
          role === 'parent' ? api.get('/api/fees', { limit: 20 }) : Promise.resolve({ data: [] })
        ]);
        setData({
          students: students.data || [],
          attendance: attendance.data || [],
          grades: grades.data || [],
          assignments: assignments.data || [],
          fees: fees.data || []
        });
      } catch (error) {
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [role]);

  const attendancePct = useMemo(() => {
    if (!data.attendance.length) return 0;
    const present = data.attendance.filter((item) => ['present', 'late'].includes(item.status)).length;
    return Math.round((present / data.attendance.length) * 100);
  }, [data.attendance]);

  const gradeAverage = useMemo(() => {
    if (!data.grades.length) return 0;
    const total = data.grades.reduce((sum, item) => sum + Number(item.totalScore || 0), 0);
    return Math.round(total / data.grades.length);
  }, [data.grades]);

  if (loading) return <Loader label="Loading dashboard" />;

  const chartData = [
    { name: 'Attendance', value: attendancePct },
    { name: 'Average', value: gradeAverage },
    { name: 'Assignments', value: data.assignments.length }
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label={role === 'parent' ? 'Children' : 'Profile'} value={data.students.length || 1} icon={GraduationCap} tone="blue" />
        <StatCard label="Attendance" value={`${attendancePct}%`} icon={ClipboardCheck} tone="green" />
        <StatCard label="Grade Average" value={`${gradeAverage}%`} icon={BookOpen} tone="amber" />
        <StatCard label="Assignments" value={data.assignments.length} icon={FileText} tone="rose" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_1fr]">
        <Card>
          <CardHeader title="Progress Snapshot" description="Current attendance, grade, and assignment signals." />
          <div className="h-72 p-5">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#087f5b" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <CardHeader title={role === 'parent' ? 'Linked Children' : 'Student Profile'} description="Class and admission details." />
          <div className="space-y-3 p-5">
            {data.students.map((student) => (
              <div key={student.id} className="rounded-lg border border-slate-100 p-4">
                <p className="font-semibold text-ink">{fullName(student.user)}</p>
                <p className="text-sm text-slate-500">{student.admissionNumber} · {student.class?.name}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

function dashboardTitle(user) {
  const schoolName = user.school?.name?.trim();
  return schoolName ? `${schoolName} Smart School Manager` : 'Smart School Manager';
}

export function DashboardPage() {
  const { user } = useAuth();
  return (
    <div>
      <PageHeader
        title={dashboardTitle(user)}
        description="Live school operations, academic progress, and role-specific tasks."
      />
      {['admin', 'teacher'].includes(user.role) ? (
        <AdminTeacherDashboard role={user.role} />
      ) : (
        <StudentParentDashboard role={user.role} />
      )}
    </div>
  );
}
