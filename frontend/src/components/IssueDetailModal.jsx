import { Pencil, Trash2, User, CalendarDays } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Badge, ISSUE_PRIORITY, ISSUE_STATUS } from '@/components/ui/Badge';
import { IssueImages } from '@/components/IssueImages';
import { formatDate } from '@/lib/format';
import { overdueDays } from '@/lib/schedule';

export function IssueDetailModal({ open, onClose, issue, canWrite, canDelete, onEdit, onDelete }) {
  if (!issue) return null;

  const prio = ISSUE_PRIORITY[issue.priority] || ISSUE_PRIORITY.medium;
  const st = ISSUE_STATUS[issue.status] || ISSUE_STATUS.open;
  const closed = issue.status === 'resolved' || issue.status === 'closed';
  const overdue = overdueDays(issue.deadline, closed);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={issue.title}
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Tutup</Button>
          {canDelete && onDelete && (
            <Button variant="danger" icon={Trash2} onClick={() => onDelete(issue)}>Hapus</Button>
          )}
          {canWrite && onEdit && (
            <Button icon={Pencil} onClick={() => onEdit(issue)}>Edit</Button>
          )}
        </>
      }
    >
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone={st.tone}>{st.label}</Badge>
          <Badge tone={prio.tone}>Prioritas: {prio.label}</Badge>
          {overdue > 0 && <Badge tone="bad">Telat {overdue} hari</Badge>}
        </div>

        <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
          <div>
            <p className="text-xs text-slate-400">Ditugaskan ke</p>
            <p className="inline-flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-200">
              <User className="h-4 w-4" />
              {issue.assignee_name || 'Belum ditugaskan'}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Deadline</p>
            <p className={overdue > 0 ? 'inline-flex items-center gap-1.5 font-medium text-red-600 dark:text-red-400' : 'inline-flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-200'}>
              <CalendarDays className="h-4 w-4" />
              {issue.deadline ? formatDate(issue.deadline) : '—'}
            </p>
          </div>
        </div>

        <div>
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">Deskripsi</p>
          {issue.description ? (
            <div className="max-h-[50vh] overflow-y-auto whitespace-pre-wrap rounded-lg border border-slate-200 bg-slate-50 p-4 text-[0.92rem] leading-relaxed text-slate-700 dark:border-line dark:bg-primary/50 dark:text-slate-200">
              {issue.description}
            </div>
          ) : (
            <p className="text-sm italic text-slate-400">Tidak ada deskripsi.</p>
          )}
        </div>

        <IssueImages issueId={issue.id} canWrite={canWrite} />

        {issue.creator_name && (
          <p className="text-xs text-slate-400">Dilaporkan oleh {issue.creator_name}</p>
        )}
      </div>
    </Modal>
  );
}
