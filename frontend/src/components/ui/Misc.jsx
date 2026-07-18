import { cn } from '@/lib/cn';
import { Loader2 } from 'lucide-react';

export function PageHeader({ title, subtitle, actions }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

export function Spinner({ className }) {
  return <Loader2 className={cn('h-5 w-5 animate-spin text-brand-500', className)} aria-hidden="true" />;
}

export function CenteredSpinner({ label = 'Memuat…' }) {
  return (
    <div className="flex items-center justify-center gap-2 py-16 text-slate-400">
      <Spinner />
      <span className="text-sm">{label}</span>
    </div>
  );
}

export function EmptyState({ title, description, action }) {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 py-14 text-center dark:border-line">
      <p className="font-medium text-slate-600 dark:text-slate-300">{title}</p>
      {description && <p className="mt-1 text-sm text-slate-400">{description}</p>}
      {action && <div className="mt-4 flex justify-center">{action}</div>}
    </div>
  );
}

export function ErrorState({ message }) {
  return (
    <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-300">
      {message}
    </div>
  );
}
