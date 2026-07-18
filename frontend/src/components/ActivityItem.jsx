import { Link } from 'react-router-dom';
import { Pencil, Trash2, Clock, User, Megaphone, Target } from 'lucide-react';
import { Badge, ACTIVITY_CATEGORY, DIRECTIVE_TYPE } from '@/components/ui/Badge';
import { formatDate, formatDuration } from '@/lib/format';
import { taskState } from '@/lib/task';

export function ActivityItem({ activity, onView, onEdit, onDelete, showAuthor = true }) {
  const cat = ACTIVITY_CATEGORY[activity.category] || ACTIVITY_CATEGORY.development;
  const duration = formatDuration(activity.duration_minutes);
  const ts = taskState(activity);
  const view = () => onView?.(activity);
  const stop = (fn) => (e) => {
    e.stopPropagation();
    fn(activity);
  };

  return (
    <div
      onClick={onView ? view : undefined}
      onKeyDown={onView ? (e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), view()) : undefined}
      role={onView ? 'button' : undefined}
      tabIndex={onView ? 0 : undefined}
      className={
        'flex items-start justify-between gap-3 rounded-lg border border-slate-200 bg-white p-3.5 dark:border-line dark:bg-secondary' +
        (onView
          ? ' cursor-pointer transition-colors hover:border-brand-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40 dark:hover:border-brand-600'
          : '')
      }
    >
      <div className="min-w-0">
        <div className="mb-1 flex flex-wrap items-center gap-2">
          <Badge tone={cat.tone}>{cat.label}</Badge>
          {ts.isTask && (
            <Badge tone={ts.tone} className="gap-1">
              <Target className="h-3 w-3" />
              {ts.label}
            </Badge>
          )}
          {activity.module_name && (
            <Link
              to={`/modules/${activity.module_id}`}
              onClick={(e) => e.stopPropagation()}
              className="text-xs font-medium text-brand-600 hover:underline dark:text-brand-100"
            >
              {activity.module_name}
            </Link>
          )}
        </div>
        <p className="font-medium text-slate-800 dark:text-slate-100">{activity.title}</p>
        {activity.description && (
          <p className="mt-0.5 line-clamp-2 text-sm text-slate-500 dark:text-slate-400">{activity.description}</p>
        )}
        <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400">
          <span>{formatDate(activity.activity_date)}</span>
          {ts.isTask && (
            <span className="inline-flex items-center gap-1">
              <Target className="h-3 w-3" /> Target {formatDate(activity.due_date)}
            </span>
          )}
          {showAuthor && activity.author_name && (
            <span className="inline-flex items-center gap-1">
              <User className="h-3 w-3" /> {activity.author_name}
            </span>
          )}
          {duration && (
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3 w-3" /> {duration}
            </span>
          )}
          {activity.directive_from && (
            <span className="inline-flex items-center gap-1">
              <Megaphone className="h-3 w-3" />
              {DIRECTIVE_TYPE[activity.directive_type]?.label
                ? `${DIRECTIVE_TYPE[activity.directive_type].label} · `
                : ''}
              {activity.directive_from}
            </span>
          )}
        </div>
      </div>
      {(onEdit || onDelete) && (
        <div className="flex shrink-0 items-center gap-1">
          {onEdit && (
            <button
              onClick={stop(onEdit)}
              className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-brand-600 dark:hover:bg-elevated"
              aria-label="Edit aktivitas"
            >
              <Pencil className="h-4 w-4" />
            </button>
          )}
          {onDelete && (
            <button
              onClick={stop(onDelete)}
              className="rounded-md p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/30"
              aria-label="Hapus aktivitas"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
