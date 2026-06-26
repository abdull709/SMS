import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { GraduationCap, Lock, Mail } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { Button } from '../components/ui/Button.jsx';

export function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: 'admin@smartschool.test', password: 'Password123!' });
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  async function submit(event) {
    event.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('Signed in');
      navigate(location.state?.from?.pathname || '/dashboard', { replace: true });
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="grid min-h-screen bg-mist lg:grid-cols-[1.05fr_0.95fr]">
      <section className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-lg bg-emerald-50 text-school-green">
              <GraduationCap className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-ink">Smart School Manager</h1>
              <p className="text-sm font-medium text-slate-500">Nursery, primary, and secondary operations</p>
            </div>
          </div>

          <form onSubmit={submit} className="rounded-lg border border-slate-200 bg-white p-6 shadow-soft">
            <h2 className="text-xl font-bold text-ink">Sign in</h2>
            <div className="mt-6 space-y-4">
              <label className="block">
                <span className="mb-1 block text-sm font-semibold text-slate-700">Email</span>
                <span className="relative block">
                  <Mail className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <input
                    className="focus-ring h-11 w-full rounded-lg border border-slate-200 pl-9 pr-3 text-sm"
                    type="email"
                    value={form.email}
                    onChange={(event) => setForm({ ...form, email: event.target.value })}
                    required
                  />
                </span>
              </label>
              <label className="block">
                <span className="mb-1 block text-sm font-semibold text-slate-700">Password</span>
                <span className="relative block">
                  <Lock className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <input
                    className="focus-ring h-11 w-full rounded-lg border border-slate-200 pl-9 pr-3 text-sm"
                    type="password"
                    value={form.password}
                    onChange={(event) => setForm({ ...form, password: event.target.value })}
                    required
                  />
                </span>
              </label>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Signing in' : 'Sign in'}
              </Button>
            </div>
          </form>
        </div>
      </section>

      <section className="hidden border-l border-slate-200 bg-white lg:block">
        <div className="flex h-full flex-col justify-between p-10">
          <div>
            <p className="text-sm font-bold uppercase tracking-wide text-school-green">School command center</p>
            <h2 className="mt-4 max-w-xl text-4xl font-bold leading-tight text-ink">Attendance, grades, assignments, announcements, and report cards in one secure workspace.</h2>
          </div>
          <div className="grid gap-4">
            {['Admin controls', 'Teacher workflows', 'Student records', 'Parent access'].map((item) => (
              <div key={item} className="rounded-lg border border-slate-200 p-4">
                <p className="font-semibold text-ink">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
