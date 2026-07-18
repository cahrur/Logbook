import { cn } from '@/lib/cn';

const baseInput =
  'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 ' +
  'placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 ' +
  'dark:border-line dark:bg-primary dark:text-slate-100';

function Wrapper({ label, htmlFor, error, hint, children }) {
  return (
    <div className="space-y-1">
      {label && (
        <label htmlFor={htmlFor} className="block text-sm font-medium text-slate-700 dark:text-slate-300">
          {label}
        </label>
      )}
      {children}
      {hint && !error && <p className="text-xs text-slate-400">{hint}</p>}
      {error && (
        <p className="text-xs text-red-500" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

// Input types that have a native picker we can open on click.
const PICKER_TYPES = new Set(['date', 'time', 'datetime-local', 'month', 'week']);

export function TextInput({ label, id, error, hint, className, onClick, ...props }) {
  const isPicker = PICKER_TYPES.has(props.type);

  // Open the calendar/picker when the whole field is clicked, not just the icon.
  const handleClick = (e) => {
    onClick?.(e);
    if (typeof e.currentTarget.showPicker === 'function') {
      try {
        e.currentTarget.showPicker();
      } catch {
        /* picker unavailable or already open — ignore */
      }
    }
  };

  return (
    <Wrapper label={label} htmlFor={id} error={error} hint={hint}>
      <input
        id={id}
        onClick={isPicker ? handleClick : onClick}
        className={cn(
          baseInput,
          isPicker && 'cursor-pointer dark:[color-scheme:dark]',
          error && 'border-red-400',
          className
        )}
        {...props}
      />
    </Wrapper>
  );
}

export function TextArea({ label, id, error, hint, className, ...props }) {
  return (
    <Wrapper label={label} htmlFor={id} error={error} hint={hint}>
      <textarea id={id} className={cn(baseInput, 'min-h-[90px] resize-y', error && 'border-red-400', className)} {...props} />
    </Wrapper>
  );
}

export function Select({ label, id, error, hint, options = [], placeholder, className, ...props }) {
  return (
    <Wrapper label={label} htmlFor={id} error={error} hint={hint}>
      <select id={id} className={cn(baseInput, error && 'border-red-400', className)} {...props}>
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </Wrapper>
  );
}
