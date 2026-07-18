import { useEffect, useState } from 'react';
import { Pencil, CalendarDays, User, Clock, Boxes, Megaphone, CheckCircle2, RotateCcw, Target } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Badge, ACTIVITY_CATEGORY, DIRECTIVE_TYPE } from '@/components/ui/Badge';
import { useUpdateActivity } from '@/hooks/useActivities';
import { formatDate, formatDuration, todayISO } from '@/lib/format';
import { taskState } from '@/lib/task';
import { apiErrorMessage } from '@/lib/api';

export function ActivityDetailModal({ open, onClose, activity, canWrite, onEdit }) {
  // Local copy so mark-done reflects immediately without closing the modal.
  const [current, setCurrent] = useState(activity);
  const updateMut = useUpdateActivity();

  useEffect(() => {
    setCurrent(activity);
  }, [activity]);

  if (!current) return null;

  const cat = ACTIVITY_CATEGORY[current.category] || ACTIVITY_CATEGORY.development;
  const dur = formatDuration(current.duration_minutes);
  const directive = DIRECTIVE_TYPE[current.directive_type];
  const hasDirective = current.directive_from || current.directive_type;
  const ts = taskState(current);

  const toggleDone = async () => {
    const payload = { completed_at: current.completed_at ? null : todayISO() };
    try {
      const updated = await updateMut.mutateAsync({ id: current.id, payload });
      setCurrent(updated);
    } catch (err) {
      window.alert(apiErrorMessage(err, 'Gagal memperbarui status'));
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={current.title}
      size="xl"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Tutup</Button>
          {canWrite && onEdit && (
            <Button variant="secondary" icon={Pencil} onClick={() => onEdit(current)}>Edit</Button>
          )}
          {canWrite && ts.isTask && (
            <Button
              icon={current.completed_at ? RotateCcw : CheckCircle2}
              loading={updateMut.isPending}
              onClick={toggleDone}
            >
              {current.completed_at ? 'Buka lagi' : 'Tandai Selesai'}
            </Button>
          )}
        </>
      }
    >
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone={cat.tone}>{cat.label}</Badge>
          {current.module_name && (
            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 dark:text-brand-300">
              <Boxes className="h-4 w-4" />
              {current.module_name}
            </span>
          )}
        </div>

        <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-slate-500 dark:text-slate-400">
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays className="h-4 w-4" />
            {formatDate(current.activity_date)}
          </span>
          {current.author_name && (
            <span className="inline-flex items-center gap-1.5">
              <User className="h-4 w-4" />
              {current.author_name}
            </span>
          )}
          {dur && (
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              {dur}
            </span>
          )}
        </div>

        {/* Task block */}
        {ts.isTask && (
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3.5 dark:border-line dark:bg-primary/50">
            <div className="mb-2 flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
                <Target className="h-3.5 w-3.5" /> Tugas
              </span>
              <Badge tone={ts.tone}>{ts.label}</Badge>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-xs text-slate-400">Target / Deadline</p>
                <p className="font-medium text-slate-700 dark:text-slate-200">{formatDate(current.due_date)}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Selesai pada</p>
                <p className="font-medium text-slate-700 dark:text-slate-200">
                  {current.completed_at ? formatDate(current.completed_at) : '—'}
                </p>
              </div>
            </div>
            {ts.done && ts.overtimeDays > 0 && (
              <p className="mt-2 text-sm font-medium text-amber-600 dark:text-amber-400">
                ⏱ Overtime {ts.overtimeDays} hari dari deadline
              </p>
            )}
            {!ts.done && ts.overdueDays > 0 && (
              <p className="mt-2 text-sm font-medium text-red-600 dark:text-red-400">
                ⚠ Terlambat {ts.overdueDays} hari dari deadline
              </p>
            )}
          </div>
        )}

        {hasDirective && (
          <div className="flex items-center gap-2.5 rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2.5 dark:border-line dark:bg-primary/50">
            <Megaphone className="h-4 w-4 shrink-0 text-slate-400" />
            <div className="flex flex-wrap items-center gap-2 text-sm">
              {directive && <Badge tone={directive.tone}>{directive.label}</Badge>}
              {current.directive_from ? (
                <span className="text-slate-600 dark:text-slate-300">
                  dari <span className="font-semibold text-slate-800 dark:text-slate-100">{current.directive_from}</span>
                </span>
              ) : (
                <span className="text-slate-500">tanpa nama pemberi</span>
              )}
            </div>
          </div>
        )}

        <div>
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">Detail</p>
          {current.description ? (
            <div className="max-h-[52vh] overflow-y-auto whitespace-pre-wrap rounded-lg border border-slate-200 bg-slate-50 p-4 text-[0.92rem] leading-relaxed text-slate-700 dark:border-line dark:bg-primary/50 dark:text-slate-200">
              {current.description}
            </div>
          ) : (
            <p className="text-sm italic text-slate-400">Tidak ada detail untuk aktivitas ini.</p>
          )}
        </div>
      </div>
    </Modal>
  );
}
