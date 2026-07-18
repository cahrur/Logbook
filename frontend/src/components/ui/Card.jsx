import { cn } from '@/lib/cn';

export function Card({ className, children, ...props }) {
  return (
    <div
      className={cn(
        'sheen rounded-xl border border-slate-200 bg-white shadow-sm',
        'dark:border-app-border dark:bg-app-surface dark:shadow-none',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className, children }) {
  return <div className={cn('px-5 pt-5', className)}>{children}</div>;
}

export function CardTitle({ className, children }) {
  return (
    <h3 className={cn('text-sm font-semibold text-slate-500 dark:text-slate-400', className)}>
      {children}
    </h3>
  );
}

export function CardContent({ className, children }) {
  return <div className={cn('px-5 py-4', className)}>{children}</div>;
}

export function ProgressBar({ value = 0, amber = false }) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-elevated">
      <div
        className={cn('h-full rounded-full', amber ? 'bg-amber-500' : 'bg-brand-500')}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
