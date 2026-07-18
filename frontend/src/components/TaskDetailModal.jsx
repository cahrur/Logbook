import { Pencil, Trash2, User, CalendarDays, Boxes, CheckCircle2 } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Badge, TASK_STATUS } from '@/components/ui/Badge';
import { formatDate } from '@/lib/format';
import { overdueDays } from '@/lib/schedule';

export function TaskDetailModal({ open, onClose, task, canWrite, canDelete, onEdit, onDelete }) {
  if (!task) return null;

  const st = TASK_STATUS[task.status] || TASK_STATUS.todo;
  const done = task.status === 'done';
  const overdue = overdueDays(task.deadline, done);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={task.title}
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Tutup</Button>
          {canDelete && onDelete && (
            <Button variant="danger" icon={Trash2} onClick={() => onDelete(task)}>Hapus</Button>
          )}
          {canWrite && onEdit && (
            <Button icon={Pencil} onClick={() => onEdit(task)}>Edit</Button>
          )}
        </>
      }
    >
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone={st.tone}>{st.label}</Badge>
          {overdue > 0 && <Badge tone="bad">Telat {overdue} hari</Badge>}
          {task.module_name && (
            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 dark:text-brand-300">
              <Boxes className="h-4 w-4" />
              {task.module_name}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-3">
          <div>
            <p className="text-xs text-slate-400">Ditugaskan ke</p>
            <p className="inline-flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-200">
              <User className="h-4 w-4" />
              {task.assignee_name || 'Belum ditugaskan'}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Deadline</p>
            <p className={overdue > 0 ? 'inline-flex items-center gap-1.5 font-medium text-red-600 dark:text-red-400' : 'inline-flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-200'}>
              <CalendarDays className="h-4 w-4" />
              {task.deadline ? formatDate(task.deadline) : '—'}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Selesai pada</p>
            <p className="inline-flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-200">
              {done && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
              {task.completed_at ? formatDate(task.completed_at) : '—'}
            </p>
          </div>
        </div>

        <div>
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">Detail</p>
          {task.detail ? (
            <div className="max-h-[50vh] overflow-y-auto whitespace-pre-wrap rounded-lg border border-slate-200 bg-slate-50 p-4 text-[0.92rem] leading-relaxed text-slate-700 dark:border-line dark:bg-primary/50 dark:text-slate-200">
              {task.detail}
            </div>
          ) : (
            <p className="text-sm italic text-slate-400">Tidak ada detail untuk tugas ini.</p>
          )}
        </div>

        {task.creator_name && (
          <p className="text-xs text-slate-400">Dibuat oleh {task.creator_name}</p>
        )}
      </div>
    </Modal>
  );
}
