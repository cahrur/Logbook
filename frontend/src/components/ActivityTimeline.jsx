import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronRight, Pencil, Trash2, User, Clock, Megaphone, Target } from 'lucide-react';
import { cn } from '@/lib/cn';
import { CenteredSpinner, EmptyState } from '@/components/ui/Misc';
import { Badge, DIRECTIVE_TYPE, ACTIVITY_CATEGORY } from '@/components/ui/Badge';
import { Select } from '@/components/ui/Field';
import { useActivities } from '@/hooks/useActivities';
import { ymd, todayISO, formatDate, formatDuration, MONTHS_FULL, WEEKDAYS } from '@/lib/format';
import { taskState } from '@/lib/task';

const CAT = {
  development: { short: 'Dev', left: 'border-l-brand-500', text: 'text-brand-600 dark:text-brand-300' },
  meeting: { short: 'Meeting', left: 'border-l-blue-500', text: 'text-blue-600 dark:text-blue-300' },
  revisi: { short: 'Revisi', left: 'border-l-amber-500', text: 'text-amber-600 dark:text-amber-300' },
  riset: { short: 'Riset', left: 'border-l-slate-400', text: 'text-slate-500 dark:text-slate-300' },
  blocked: { short: 'Blocked', left: 'border-l-red-500', text: 'text-red-600 dark:text-red-300' },
};

const CATEGORY_OPTIONS = Object.entries(ACTIVITY_CATEGORY).map(([value, v]) => ({ value, label: v.label }));
const DIRECTIVE_OPTIONS = Object.entries(DIRECTIVE_TYPE).map(([value, v]) => ({ value, label: v.label }));
const TASK_OPTIONS = [
  { value: 'task', label: 'Semua tugas (deadline)' },
  { value: 'todo', label: 'Tugas belum selesai' },
  { value: 'done', label: 'Tugas selesai' },
];

const TODAY = todayISO();

function ActivityCard({ activity, onView, onEdit, onDelete }) {
  const cat = CAT[activity.category] || CAT.development;
  const dur = formatDuration(activity.duration_minutes);
  const ts = taskState(activity);
  const view = () => onView?.(activity);
  const stop = (fn) => (e) => {
    e.stopPropagation();
    fn(activity);
  };
  return (
    <div
      onClick={view}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), view())}
      role="button"
      tabIndex={0}
      title="Lihat detail"
      className={cn(
        'cursor-pointer rounded-lg border border-l-[3px] border-slate-200 bg-white p-2.5 transition-colors hover:border-brand-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40 dark:border-line dark:bg-primary/50 dark:hover:border-brand-600',
        cat.left
      )}
    >
      <div className="flex items-start justify-between gap-1">
        <span className={cn('text-[0.62rem] font-extrabold uppercase tracking-wide', cat.text)}>{cat.short}</span>
        {(onEdit || onDelete) && (
          <span className="flex shrink-0 items-center">
            {onEdit && (
              <button onClick={stop(onEdit)} className="rounded p-0.5 text-slate-300 hover:text-brand-600" aria-label="Edit">
                <Pencil className="h-3.5 w-3.5" />
              </button>
            )}
            {onDelete && (
              <button onClick={stop(onDelete)} className="rounded p-0.5 text-slate-300 hover:text-red-500" aria-label="Hapus">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}
          </span>
        )}
      </div>
      <p className="mt-0.5 text-[0.84rem] font-semibold leading-snug text-slate-800 dark:text-slate-100">{activity.title}</p>
      {ts.isTask && (
        <div className="mt-1 flex items-center gap-1.5">
          <Badge tone={ts.tone} className="gap-1 px-2 py-0 text-[0.6rem]">
            <Target className="h-2.5 w-2.5" />{ts.label}
          </Badge>
          <span className="text-[0.64rem] text-slate-400">{formatDate(activity.due_date)}</span>
        </div>
      )}
      {activity.description && (
        <p className="mt-0.5 line-clamp-2 text-[0.75rem] text-slate-500 dark:text-slate-400">{activity.description}</p>
      )}
      {activity.directive_from && (
        <div className="mt-1 inline-flex items-center gap-1 rounded bg-slate-100 px-1.5 py-0.5 text-[0.66rem] font-medium text-slate-600 dark:bg-elevated/60 dark:text-slate-300">
          <Megaphone className="h-3 w-3 shrink-0" />
          {DIRECTIVE_TYPE[activity.directive_type]?.label
            ? `${DIRECTIVE_TYPE[activity.directive_type].label} · `
            : ''}
          {activity.directive_from}
        </div>
      )}
      <div className="mt-1 flex flex-wrap items-center gap-x-2 text-[0.7rem] text-slate-400">
        {activity.author_name && (
          <span className="inline-flex items-center gap-1"><User className="h-3 w-3" />{activity.author_name}</span>
        )}
        {dur && <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" />{dur}</span>}
      </div>
    </div>
  );
}

function DayColumn({ date, activities, gapToNext, isFirst, isLast, onView, onEdit, onDelete }) {
  const d = new Date(Number(date.slice(0, 4)), Number(date.slice(5, 7)) - 1, Number(date.slice(8, 10)));
  const isToday = date === TODAY;

  return (
    <div className="flex w-[250px] shrink-0 flex-col">
      <div className="relative h-[82px]">
        {/* horizontal line — connects centered nodes */}
        <div
          className="absolute top-[47px] h-0.5 bg-brand-500/30"
          style={{ left: isFirst ? '50%' : 0, right: isLast ? '50%' : 0 }}
        />
        {isToday && (
          <span className="absolute left-1/2 top-0 -translate-x-1/2 text-[0.52rem] font-extrabold tracking-wider text-brand-600 dark:text-brand-300">
            HARI INI
          </span>
        )}
        {/* node (centered over the card) */}
        <div
          className={cn(
            'absolute left-1/2 top-6 z-10 flex h-[46px] w-[46px] -translate-x-1/2 flex-col items-center justify-center rounded-full border-2 ring-4 ring-white dark:ring-secondary',
            isToday
              ? 'border-brand-500 bg-brand-500 text-white'
              : 'border-brand-500 bg-white text-brand-600 dark:bg-secondary dark:text-brand-300'
          )}
        >
          <span className="text-[1.05rem] font-extrabold leading-none tabular-nums">{d.getDate()}</span>
          <span className="text-[0.55rem] font-bold uppercase tracking-wide opacity-80">{WEEKDAYS[d.getDay()]}</span>
        </div>
        {/* arrow at the boundary (midpoint between this node and the next) */}
        {!isLast && <ChevronRight className="absolute right-0 top-[38px] z-20 h-[18px] w-[18px] translate-x-1/2 text-brand-500" strokeWidth={2.4} />}
        {/* gap label for skipped empty days */}
        {!isLast && gapToNext > 1 && (
          <span className="absolute right-0 top-[52px] translate-x-1/2 whitespace-nowrap rounded-md bg-white px-1.5 text-[0.6rem] font-bold text-slate-400 dark:bg-secondary">
            +{gapToNext} hari
          </span>
        )}
      </div>

      <div className="flex flex-col gap-2 px-3.5 pb-2">
        {activities.map((a) => (
          <ActivityCard key={a.id} activity={a} onView={onView} onEdit={onEdit} onDelete={onDelete} />
        ))}
      </div>
      <div className="px-3.5 pb-3 text-[0.66rem] tabular-nums text-slate-400">{activities.length} aktivitas</div>
    </div>
  );
}

export function ActivityTimeline({ moduleId, onView, onEdit, onDelete }) {
  const { data: activities, isLoading } = useActivities({ module_id: moduleId });
  const [activeMonth, setActiveMonth] = useState(null);
  const [catFilter, setCatFilter] = useState('');
  const [directiveFilter, setDirectiveFilter] = useState('');
  const [taskFilter, setTaskFilter] = useState('');
  const scrollerRef = useRef(null);

  // Apply category / directive / task filters client-side (all module activities are already loaded).
  const filtered = useMemo(() => {
    let list = activities || [];
    if (catFilter) list = list.filter((a) => a.category === catFilter);
    if (directiveFilter) list = list.filter((a) => a.directive_type === directiveFilter);
    if (taskFilter === 'task') list = list.filter((a) => a.due_date);
    else if (taskFilter === 'todo') list = list.filter((a) => a.due_date && !a.completed_at);
    else if (taskFilter === 'done') list = list.filter((a) => a.due_date && a.completed_at);
    return list;
  }, [activities, catFilter, directiveFilter, taskFilter]);

  // Group filtered activities by month, then by day.
  const byMonth = useMemo(() => {
    const map = {};
    filtered.forEach((a) => {
      const key = ymd(a.activity_date).slice(0, 7);
      (map[key] ||= []).push(a);
    });
    return map;
  }, [filtered]);

  const monthKeys = useMemo(() => Object.keys(byMonth).sort(), [byMonth]);

  // Default to the current month if present, otherwise the latest.
  useEffect(() => {
    if (!monthKeys.length) {
      setActiveMonth(null);
      return;
    }
    if (!activeMonth || !monthKeys.includes(activeMonth)) {
      const current = TODAY.slice(0, 7);
      setActiveMonth(monthKeys.includes(current) ? current : monthKeys[monthKeys.length - 1]);
    }
  }, [monthKeys, activeMonth]);

  const days = useMemo(() => {
    const bucket = activeMonth ? byMonth[activeMonth] : null;
    if (!bucket) return [];
    const perDay = {};
    bucket.forEach((a) => {
      const key = ymd(a.activity_date);
      (perDay[key] ||= []).push(a);
    });
    return Object.keys(perDay)
      .sort()
      .map((date) => ({ date, activities: perDay[date] }));
  }, [activeMonth, byMonth]);

  // Scroll to the most recent day when viewing the current month.
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollLeft = activeMonth === TODAY.slice(0, 7) ? el.scrollWidth : 0;
  }, [activeMonth, days.length]);

  if (isLoading) return <CenteredSpinner />;
  if (!activities || activities.length === 0) {
    return <EmptyState title="Belum ada aktivitas di modul ini" />;
  }

  const dayDiff = (a, b) => Math.round((new Date(b) - new Date(a)) / 86400000);
  const hasResults = monthKeys.length > 0;

  return (
    <div>
      {/* Category + directive + task filters */}
      <div className="mb-3 grid grid-cols-1 gap-2 sm:grid-cols-3 lg:max-w-2xl">
        <Select placeholder="Semua kategori" options={CATEGORY_OPTIONS} value={catFilter} onChange={(e) => setCatFilter(e.target.value)} />
        <Select placeholder="Semua arahan/keputusan" options={DIRECTIVE_OPTIONS} value={directiveFilter} onChange={(e) => setDirectiveFilter(e.target.value)} />
        <Select placeholder="Semua aktivitas" options={TASK_OPTIONS} value={taskFilter} onChange={(e) => setTaskFilter(e.target.value)} />
      </div>

      {!hasResults ? (
        <EmptyState title="Tidak ada aktivitas yang cocok" description="Coba ubah atau hapus filter." />
      ) : (
        <>
          {/* Month filter */}
          <div className="mb-3 flex gap-1.5 overflow-x-auto pb-1">
            {monthKeys.map((key) => {
              const [y, m] = key.split('-');
              const count = new Set(byMonth[key].map((a) => ymd(a.activity_date))).size;
              const active = key === activeMonth;
              return (
                <button
                  key={key}
                  onClick={() => setActiveMonth(key)}
                  aria-pressed={active}
                  className={cn(
                    'flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-semibold transition-colors',
                    active
                      ? 'border-brand-500 bg-brand-500 text-white'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-brand-300 dark:border-line dark:bg-secondary dark:text-slate-300'
                  )}
                >
                  {MONTHS_FULL[Number(m) - 1]} {y}
                  <span className="text-[0.65rem] opacity-70">{count} hari</span>
                </button>
              );
            })}
          </div>

          {/* Horizontal scrollable timeline */}
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-line dark:bg-secondary">
            <div ref={scrollerRef} className="overflow-x-auto overflow-y-hidden px-1 pb-3">
              <div className="flex min-w-min">
                {days.map((day, i) => (
                  <DayColumn
                    key={day.date}
                    date={day.date}
                    activities={day.activities}
                    isFirst={i === 0}
                    isLast={i === days.length - 1}
                    gapToNext={i < days.length - 1 ? dayDiff(day.date, days[i + 1].date) : 0}
                    onView={onView}
                    onEdit={onEdit}
                    onDelete={onDelete}
                  />
                ))}
              </div>
            </div>
            <p className="px-4 pb-2 text-right text-[0.72rem] text-slate-400">← garis waktu bisa di-scroll →</p>
          </div>
        </>
      )}
    </div>
  );
}
