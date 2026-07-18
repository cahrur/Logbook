import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Boxes, Activity, Ban, CheckCircle2, CalendarDays } from 'lucide-react';
import { useDashboard } from '@/hooks/useActivities';
import { useMyTasks } from '@/hooks/useTasks';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/cn';
import { CenteredSpinner, ErrorState, EmptyState } from '@/components/ui/Misc';
import { Card, ProgressBar } from '@/components/ui/Card';
import { WelcomeCard } from '@/components/ui/WelcomeCard';
import { Badge, MODULE_STATUS, TASK_STATUS } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ActivityItem } from '@/components/ActivityItem';
import { ActivityFormModal } from '@/components/ActivityFormModal';
import { apiErrorMessage } from '@/lib/api';
import { formatDate } from '@/lib/format';

function StatCard({ icon: Icon, label, value, tone = 'text-app-primary', ring = 'bg-app-primary/10' }) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-3">
        <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-[10px] ${ring} ${tone}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="text-2xl font-bold tabular-nums text-app-text">{value}</p>
          <p className="truncate text-xs text-app-faint">{label}</p>
        </div>
      </div>
    </Card>
  );
}

export default function DashboardPage() {
  const { data, isLoading, isError, error } = useDashboard();
  const { canWrite, user } = useAuth();
  const { data: myTasks = [] } = useMyTasks(user?.id);
  const [modalOpen, setModalOpen] = useState(false);

  if (isLoading) return <CenteredSpinner />;
  if (isError) return <ErrorState message={apiErrorMessage(error)} />;

  const { stats, modules, recent_activities: recent } = data;

  return (
    <>
      <WelcomeCard
        greeting={`Halo, ${user?.name?.split(' ')[0] || ''}! 👋`}
        subtitle="Ringkasan proyek Anda hari ini."
        action={
          canWrite && (
            <Button icon={Plus} onClick={() => setModalOpen(true)}>
              Catat Aktivitas
            </Button>
          )
        }
      />

      <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard icon={Boxes} label="Total modul" value={stats.total_modules} />
        <StatCard icon={Activity} label="Aktivitas minggu ini" value={stats.activities_this_week} />
        <StatCard
          icon={CheckCircle2}
          label="Modul selesai"
          value={stats.done_modules}
          tone="text-emerald-400"
          ring="bg-emerald-500/10"
        />
        <StatCard
          icon={Ban}
          label="Blocked minggu ini"
          value={stats.blocked_this_week}
          tone="text-red-400"
          ring="bg-red-500/10"
        />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-5">
        {/* My latest tasks */}
        <section className="lg:col-span-3">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Tugas Terbaru</h2>
            <Link to="/tasks" className="text-sm font-medium text-brand-600 hover:underline dark:text-brand-100">
              Lihat semua
            </Link>
          </div>
          {myTasks.length === 0 ? (
            <EmptyState title="Belum ada tugas untukmu" />
          ) : (
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {myTasks.slice(0, 5).map((t) => {
                const st = TASK_STATUS[t.status] || TASK_STATUS.todo;
                const done = t.status === 'done';
                return (
                  <Card key={t.id} className="p-3.5">
                    <div className="flex items-center justify-between gap-2">
                      <p className={cn('truncate font-medium', done ? 'text-slate-400 line-through dark:text-slate-500' : 'text-slate-800 dark:text-slate-100')}>
                        {t.title}
                      </p>
                      <Badge tone={st.tone}>{st.label}</Badge>
                    </div>
                    <p className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-400">
                      {t.module_name}
                      {t.deadline && (
                        <>
                          <span aria-hidden="true">·</span>
                          <CalendarDays className="h-3 w-3" />
                          {formatDate(t.deadline)}
                        </>
                      )}
                    </p>
                  </Card>
                );
              })}
            </div>
          )}
        </section>

        {/* Recent activity */}
        <section className="lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Aktivitas Terbaru</h2>
            <Link to="/activities" className="text-sm font-medium text-brand-600 hover:underline dark:text-brand-100">
              Lihat semua
            </Link>
          </div>
          {recent.length === 0 ? (
            <EmptyState title="Belum ada aktivitas" />
          ) : (
            <div className="space-y-2.5">
              {recent.map((a) => (
                <ActivityItem key={a.id} activity={a} />
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Modules */}
      <section className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Progres Modul</h2>
          <Link to="/modules" className="text-sm font-medium text-brand-600 hover:underline dark:text-brand-100">
            Lihat semua
          </Link>
        </div>
        {modules.length === 0 ? (
          <EmptyState title="Belum ada modul" description="Tambahkan modul pertama di halaman Modul." />
        ) : (
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {modules.slice(0, 5).map((m) => {
              const st = MODULE_STATUS[m.status] || MODULE_STATUS.planned;
              return (
                <Link key={m.id} to={`/modules/${m.id}`}>
                  <Card className="p-3.5 transition-colors hover:border-brand-300 dark:hover:border-brand-700">
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate font-medium text-slate-800 dark:text-slate-100">{m.name}</p>
                        <p className="text-xs text-slate-400">
                          {m.pic_name ? `PIC: ${m.pic_name}` : 'PIC belum ditentukan'} · {m.activity_count} aktivitas
                        </p>
                      </div>
                      <Badge tone={st.tone}>{st.label}</Badge>
                    </div>
                    <div className="mt-2.5 flex items-center gap-3">
                      <ProgressBar value={m.progress} amber={m.status === 'on_hold'} />
                      <span className="w-10 text-right text-xs font-medium tabular-nums text-slate-500 dark:text-slate-400">
                        {m.progress}%
                      </span>
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      <ActivityFormModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}
