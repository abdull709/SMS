import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { api } from '../lib/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { PageHeader } from '../components/layout/PageHeader.jsx';
import { Card, CardHeader } from '../components/ui/Card.jsx';
import { Loader } from '../components/ui/Loader.jsx';
import { fullName } from '../lib/format.js';

export function ProfilePage() {
  const { user } = useAuth();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(user.role === 'student');

  useEffect(() => {
    async function load() {
      if (user.role !== 'student') return;
      try {
        const data = await api.get('/api/students', { limit: 1 });
        setStudent(data.data?.[0] || null);
      } catch (error) {
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user.role]);

  if (loading) return <Loader label="Loading profile" />;

  return (
    <div>
      <PageHeader title="Profile" description="Personal, class, and guardian details." />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Account" />
          <dl className="grid gap-4 p-5 text-sm">
            <div><dt className="font-semibold text-slate-500">Name</dt><dd className="mt-1 text-ink">{fullName(user)}</dd></div>
            <div><dt className="font-semibold text-slate-500">Email</dt><dd className="mt-1 text-ink">{user.email}</dd></div>
            <div><dt className="font-semibold text-slate-500">Role</dt><dd className="mt-1 capitalize text-ink">{user.role}</dd></div>
          </dl>
        </Card>
        <Card>
          <CardHeader title="School Record" />
          <dl className="grid gap-4 p-5 text-sm">
            <div><dt className="font-semibold text-slate-500">Admission Number</dt><dd className="mt-1 text-ink">{student?.admissionNumber || '-'}</dd></div>
            <div><dt className="font-semibold text-slate-500">Class</dt><dd className="mt-1 text-ink">{student?.class?.name || '-'}</dd></div>
            <div><dt className="font-semibold text-slate-500">Parents</dt><dd className="mt-1 text-ink">{student?.parents?.map((parent) => fullName(parent.user)).join(', ') || '-'}</dd></div>
          </dl>
        </Card>
      </div>
    </div>
  );
}
