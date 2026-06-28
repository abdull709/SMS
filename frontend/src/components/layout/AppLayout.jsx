import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { Button } from '../ui/Button.jsx';
import { roleNavigation } from './navigation.js';

function initials(user) {
  return `${user?.firstName?.[0] || ''}${user?.lastName?.[0] || ''}`.toUpperCase();
}

function roleLabel(user) {
  return user.isSuperAdmin ? 'Super Admin' : user.role;
}

function Sidebar({ open, onClose }) {
  const { user, logout } = useAuth();
  const navItems = (roleNavigation[user.role] || []).filter((item) => !item.superAdminOnly || user.isSuperAdmin);

  return (
    <>
      <div className={`fixed inset-0 z-30 bg-slate-950/40 transition lg:hidden ${open ? 'block' : 'hidden'}`} onClick={onClose} />
      <aside className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-slate-200 bg-white transition-transform lg:static lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex h-16 items-center justify-between border-b border-slate-100 px-5">
          <div>
            <p className="text-base font-bold text-ink">Smart School</p>
            <p className="text-xs font-semibold uppercase tracking-wide text-school-green">Manager</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="lg:hidden" aria-label="Close navigation">
            <X className="h-5 w-5" />
          </Button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) => `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition ${isActive ? 'bg-blue-50 text-school-blue' : 'text-slate-600 hover:bg-slate-50 hover:text-ink'}`}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="border-t border-slate-100 p-4">
          <div className="mb-3 flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-emerald-50 text-sm font-bold text-school-green">
              {initials(user)}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-ink">{user.firstName} {user.lastName}</p>
              <p className="text-xs capitalize text-slate-500">{roleLabel(user)}</p>
            </div>
          </div>
          <Button variant="secondary" className="w-full justify-start" onClick={logout}>
            <LogOut className="h-4 w-4" />
            Sign out
          </Button>
        </div>
      </aside>
    </>
  );
}

export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-mist lg:flex">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur lg:px-8">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)} className="lg:hidden" aria-label="Open navigation">
              <Menu className="h-5 w-5" />
            </Button>
            <div>
              <p className="text-sm font-semibold text-slate-500">Welcome back</p>
              <h1 className="text-lg font-bold text-ink">{user.firstName} {user.lastName}</h1>
            </div>
          </div>
          <span className="rounded-lg bg-amber-50 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-school-amber">{roleLabel(user)}</span>
        </header>
        <main className="mx-auto w-full max-w-7xl px-4 py-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
