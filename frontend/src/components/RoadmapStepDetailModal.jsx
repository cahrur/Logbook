import { Pencil, Trash2, CalendarDays } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Badge, MODULE_STATUS } from '@/components/ui/Badge';
import { formatDate } from '@/lib/format';
import { roadmapOverdue } from '@/lib/roadmap';

export function RoadmapStepDetailModal({ open, onClose, step, canWrite, canDelete, onEdit, onDelete }) {
  if (!step) return null;

  const st = MODULE_STATUS[step.status] || MODULE_STATUS.planned;
  const overdue = roadmapOverdue(step);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={step.title}
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Tutup</Button>
          {canDelete && onDelete && (
            <Button variant="danger" icon={Trash2} onClick={() => onDelete(step)}>Hapus</Button>
          )}
          {canWrite && onEdit && (
            <Button icon={Pencil} onClick={() => onEdit(step)}>Edit</Button>
          )}
        </>
      }
    >
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <Badge tone={st.tone}>{st.label}</Badge>
          {overdue > 0 && <Badge tone="bad">Telat {overdue} hari</Badge>}
          {step.target_date && (
            <span
              className={
                'inline-flex items-center gap-1.5 text-sm ' +
                (overdue > 0 ? 'font-medium text-red-600 dark:text-red-400' : 'text-slate-500 dark:text-slate-400')
              }
            >
              <CalendarDays className="h-4 w-4" />
              Target {formatDate(step.target_date)}
            </span>
          )}
        </div>

        <div>
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">Detail</p>
          {step.description ? (
            <div className="max-h-[52vh] overflow-y-auto whitespace-pre-wrap rounded-lg border border-slate-200 bg-slate-50 p-4 text-[0.92rem] leading-relaxed text-slate-700 dark:border-line dark:bg-primary/50 dark:text-slate-200">
              {step.description}
            </div>
          ) : (
            <p className="text-sm italic text-slate-400">Belum ada detail untuk step ini.</p>
          )}
        </div>
      </div>
    </Modal>
  );
}
