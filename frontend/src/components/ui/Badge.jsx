import { cn } from '@/lib/cn';

const TONES = {
  good: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  warn: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  bad: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  info: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  accent: 'bg-brand-50 text-brand-600 dark:bg-brand-700/30 dark:text-brand-100',
  neutral: 'bg-slate-100 text-slate-600 dark:bg-elevated/50 dark:text-slate-300',
};

export function Badge({ tone = 'neutral', className, children }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap',
        TONES[tone],
        className
      )}
    >
      {children}
    </span>
  );
}

// Shared mappings so status/category chips look identical everywhere.
export const MODULE_STATUS = {
  planned: { label: 'Planned', tone: 'neutral' },
  in_progress: { label: 'In Progress', tone: 'info' },
  done: { label: 'Done', tone: 'good' },
  on_hold: { label: 'On Hold', tone: 'warn' },
};

export const ACTIVITY_CATEGORY = {
  development: { label: 'Development', tone: 'accent' },
  meeting: { label: 'Meeting', tone: 'info' },
  revisi: { label: 'Revisi', tone: 'warn' },
  riset: { label: 'Riset', tone: 'neutral' },
  blocked: { label: 'Blocked', tone: 'bad' },
};

export const ROLE_BADGE = {
  superadmin: { label: 'Superadmin', tone: 'bad' },
  admin: { label: 'Admin', tone: 'accent' },
  member: { label: 'Member', tone: 'info' },
  viewer: { label: 'Viewer', tone: 'neutral' },
};

// Issue (bug report) priority + status.
export const ISSUE_PRIORITY = {
  low: { label: 'Low', tone: 'neutral' },
  medium: { label: 'Medium', tone: 'info' },
  high: { label: 'High', tone: 'warn' },
  critical: { label: 'Critical', tone: 'bad' },
};
export const ISSUE_PRIORITY_ORDER = ['low', 'medium', 'high', 'critical'];

export const ISSUE_STATUS = {
  open: { label: 'Open', tone: 'warn' },
  in_progress: { label: 'In Progress', tone: 'info' },
  resolved: { label: 'Resolved', tone: 'good' },
  closed: { label: 'Closed', tone: 'neutral' },
};
export const ISSUE_STATUS_ORDER = ['open', 'in_progress', 'resolved', 'closed'];

// Task workflow status.
export const TASK_STATUS = {
  todo: { label: 'Akan Dikerjakan', tone: 'neutral' },
  in_progress: { label: 'Sedang Dikerjakan', tone: 'info' },
  review: { label: 'Review', tone: 'warn' },
  done: { label: 'Selesai', tone: 'good' },
};
export const TASK_STATUS_ORDER = ['todo', 'in_progress', 'review', 'done'];

// Who gave the direction behind an activity (input / decision / change / instruction).
export const DIRECTIVE_TYPE = {
  masukan: { label: 'Masukan', tone: 'info' },
  keputusan: { label: 'Keputusan', tone: 'good' },
  perubahan: { label: 'Perubahan', tone: 'warn' },
  arahan: { label: 'Arahan', tone: 'accent' },
};
