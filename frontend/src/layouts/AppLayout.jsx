import { useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Boxes,
  ListChecks,
  ClipboardList,
  Users,
  LogOut,
  AlignLeft,
  X,
  NotebookPen,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import { cn } from '@/lib/cn';
import { useAuth } from '@/context/AuthContext';

const NAV = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/modules', label: 'Modul', icon: Boxes },
  { to: '/activities', label: 'Aktivitas', icon: ListChecks },
  { to: '/tasks', label: 'Tugas', icon: ClipboardList },
  { to: '/users', label: 'Tim', icon: Users, adminOnly: true },
];

const SIDEBAR_STORAGE_KEY = 'sidebar-collapsed';

function NavItems({ isAdmin, onNavigate, collapsed = false }) {
  return (
    <nav className="flex flex-col gap-1">
      {NAV.filter((item) => !item.adminOnly || isAdmin).map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          onClick={onNavigate}
          title={collapsed ? label : undefined}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 rounded-[10px] px-3 py-2 text-sm font-medium transition-colors',
              collapsed && 'justify-center px-2',
              isActive
                ? 'bg-app-primary text-app-on-primary'
                : 'text-app-text hover:bg-app-fill-strong'
            )
          }
        >
          <Icon className="h-[18px] w-[18px] shrink-0" strokeWidth={2} aria-hidden="true" />
          {!collapsed && <span className="flex-1">{label}</span>}
        </NavLink>
      ))}
    </nav>
  );
}

function SidebarBrand({ collapsed }) {
  return (
    <div
      className={cn(
        'flex h-14 items-center gap-2 border-b border-app-border-strong px-4',
        collapsed && 'justify-center px-0'
      )}
    >
      <NotebookPen className="h-6 w-6 shrink-0 text-app-primary" />
      {!collapsed && (
        <span className="text-lg font-bold tracking-wide text-app-text">Logbook</span>
      )}
    </div>
  );
}

export function AppLayout() {
  const { user, isAdmin, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.localStorage.getItem(SIDEBAR_STORAGE_KEY) === 'true';
  });

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      const next = !prev;
      window.localStorage.setItem(SIDEBAR_STORAGE_KEY, String(next));
      return next;
    });
  };

  const { pathname } = useLocation();
  const pageTitle =
    [...NAV]
      .sort((a, b) => b.to.length - a.to.length)
      .find((n) => (n.to === '/' ? pathname === '/' : pathname.startsWith(n.to)))?.label || 'Logbook';

  const initials = (user?.name || '?')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((s) => s[0])
    .join('')
    .toUpperCase();

  const SidebarFooter = ({ compact }) => (
    <div className="mt-auto flex flex-col gap-2 border-t border-app-border-strong p-3">
      <button
        onClick={toggleCollapsed}
        title={collapsed ? 'Perluas sidebar' : 'Ciutkan sidebar'}
        aria-label={collapsed ? 'Perluas sidebar' : 'Ciutkan sidebar'}
        className={cn(
          'hidden items-center gap-3 rounded-[10px] px-3 py-2 text-sm font-medium text-app-muted transition-colors hover:bg-app-fill-strong hover:text-app-text lg:flex',
          collapsed && 'justify-center px-2'
        )}
      >
        {collapsed ? (
          <PanelLeftOpen className="h-[18px] w-[18px] shrink-0" />
        ) : (
          <>
            <PanelLeftClose className="h-[18px] w-[18px] shrink-0" />
            <span>Ciutkan</span>
          </>
        )}
      </button>

      <button
        onClick={logout}
        title="Keluar"
        aria-label="Keluar"
        className={cn(
          'flex items-center gap-3 rounded-[10px] bg-red-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700',
          compact && collapsed && 'justify-center px-2'
        )}
      >
        <LogOut className="h-[18px] w-[18px] shrink-0" />
        {!(compact && collapsed) && <span>Keluar</span>}
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-app-bg">
      {/* Sidebar (desktop) */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-30 hidden flex-col border-r border-app-border-strong bg-app-bg transition-[width] duration-200 lg:flex',
          collapsed ? 'w-20' : 'w-64'
        )}
      >
        <SidebarBrand collapsed={collapsed} />
        <div className="no-scrollbar flex-1 overflow-y-auto p-3">
          <NavItems isAdmin={isAdmin} collapsed={collapsed} />
        </div>
        <SidebarFooter compact />
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <aside className="absolute inset-y-0 left-0 flex w-64 flex-col border-r border-app-border-strong bg-app-bg">
            <div className="flex h-14 items-center justify-between border-b border-app-border-strong px-4">
              <span className="flex items-center gap-2 text-lg font-bold text-app-text">
                <NotebookPen className="h-6 w-6 text-app-primary" /> Logbook
              </span>
              <button
                onClick={() => setMobileOpen(false)}
                aria-label="Tutup menu"
                className="grid h-7 w-7 place-items-center rounded-[10px] bg-app-fill text-app-text hover:bg-app-fill-strong"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="no-scrollbar flex-1 overflow-y-auto p-3">
              <NavItems isAdmin={isAdmin} onNavigate={() => setMobileOpen(false)} />
            </div>
            <SidebarFooter />
          </aside>
        </div>
      )}

      {/* Main column */}
      <div className={cn('transition-[padding] duration-200', collapsed ? 'lg:pl-20' : 'lg:pl-64')}>
        <header className="sticky top-0 z-20 flex h-14 items-center justify-between gap-3 border-b border-app-border-strong bg-app-bg/90 px-4 backdrop-blur sm:px-6">
          <div className="flex items-center gap-3">
            <button
              className="grid h-9 w-9 place-items-center rounded-[10px] text-app-text hover:bg-app-fill-strong lg:hidden"
              onClick={() => setMobileOpen(true)}
              aria-label="Buka menu"
            >
              <AlignLeft className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2.5">
              <span className="hidden h-6 w-1 rounded-full bg-app-primary sm:block" aria-hidden="true" />
              <h1 className="text-base font-bold tracking-wide text-app-text">{pageTitle}</h1>
            </div>
          </div>

          <div
            className="grid h-9 w-9 shrink-0 place-items-center rounded-[10px] bg-app-primary text-xs font-bold text-app-on-primary"
            title={user?.name}
          >
            {initials}
          </div>
        </header>

        <main className="px-4 py-4 sm:px-6 sm:py-5">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
