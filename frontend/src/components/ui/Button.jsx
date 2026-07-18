import { cn } from '@/lib/cn';
import { Loader2 } from 'lucide-react';

const VARIANTS = {
  primary:
    'bg-brand-500 text-white hover:bg-brand-600 focus-visible:ring-brand-500/40 disabled:bg-brand-500/50',
  secondary:
    'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 focus-visible:ring-slate-400/40 dark:bg-secondary dark:text-slate-200 dark:border-line dark:hover:bg-elevated',
  danger:
    'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500/40 disabled:bg-red-600/50',
  ghost:
    'bg-transparent text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-secondary',
};

const SIZES = {
  sm: 'text-sm px-3 py-1.5 gap-1.5',
  md: 'text-sm px-4 py-2 gap-2',
  lg: 'text-base px-5 py-2.5 gap-2',
};

export function Button({
  variant = 'primary',
  size = 'md',
  icon: Icon,
  loading = false,
  disabled,
  className,
  children,
  ...props
}) {
  return (
    <button
      className={cn(
        'sheen inline-flex items-center justify-center rounded-[10px] font-medium transition-colors',
        'focus:outline-none focus-visible:ring-2 disabled:cursor-not-allowed',
        VARIANTS[variant],
        SIZES[size],
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
      ) : (
        Icon && <Icon className="h-4 w-4" aria-hidden="true" />
      )}
      {children}
    </button>
  );
}
