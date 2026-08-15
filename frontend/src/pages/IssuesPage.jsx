import { useState } from 'react';
import { Boxes, CalendarDays } from 'lucide-react';
import { cn } from '@/lib/cn';
import { useAuth } from '@/context/AuthContext';
import { useMyIssues, useUpdateIssue, useDeleteIssue } from '@/hooks/useIssues';
import { PageHeader, CenteredSpinner, ErrorState } from '@/components/ui/Misc';
import { Badge, ISSUE_PRIORITY, ISSUE_STATUS, ISSUE_STATUS_ORDER } from '@/components/ui/Badge';
import { IssueDetailModal } from '@/components/IssueDetailModal';
import { IssueFormModal } from '@/components/IssueFormModal';
import { formatDate } from '@/lib/format';
import { overdueDays } from '@/lib/schedule';
import { apiErrorMessage } from '@/lib/api';

const COLUMN_ACCENT = {
  open: 'border-t-amber-500',
  in_progress: 'border-t-blue-500',
  resolved: 'border-t-emerald-500',
  closed: 'border-t-slate-400',
};

function IssueCard({ issue, onDragStart, onDragEnd, onClick, dragging }) {
  const closed = issue.status === 'resolved' || issue.status === 'closed';
  const overdue = overdueDays(issue.deadline, closed);
  const prio = ISSUE_PRIORITY[issue.priority] || ISSUE_PRIORITY.medium;
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, issue)}
      onDragEnd={onDragEnd}
      onClick={() => onClick(issue)}
      className={cn(
        'cursor-grab rounded-lg border border-slate-200 bg-white p-3 shadow-sm transition-colors hover:border-brand-300 active:cursor-grabbing dark:border-line dark:bg-secondary dark:hover:border-brand-600',
        dragging && 'opacity-40'
      )}
    >
      <Badge tone={prio.tone} className="mb-1.5">{prio.label}</Badge>
      <p className={cn('text-sm font-medium', closed ? 'text-slate-400 line-through dark:text-slate-500' : 'text-slate-800 dark:text-slate-100')}>
        {issue.title}
      </p>
      {issue.module_name && (
        <span className="mt-1.5 inline-flex items-center gap-1 rounded bg-brand-50 px-1.5 py-0.5 text-[0.66rem] font-medium text-brand-600 dark:bg-brand-700/30 dark:text-brand-200">
          <Boxes className="h-3 w-3" />
          {issue.module_name}
        </span>
      )}
      {issue.deadline && (
        <div className={cn('mt-1.5 flex items-center gap-1 text-xs', overdue > 0 ? 'font-medium text-red-600 dark:text-red-400' : 'text-slate-400')}>
          <CalendarDays className="h-3 w-3" />
          {formatDate(issue.deadline)}
          {overdue > 0 ? ` · telat ${overdue}h` : ''}
        </div>
      )}
    </div>
  );
}

export default function IssuesPage() {
  const { user, canWrite, canDelete } = useAuth();
  const { data: issues, isLoading, isError, error } = useMyIssues(user?.id);
  const updateMut = useUpdateIssue();
  const deleteMut = useDeleteIssue();
  const [draggingId, setDraggingId] = useState(null);
  const [overCol, setOverCol] = useState(null);
  const [viewing, setViewing] = useState(null);
  const [editing, setEditing] = useState(null);
  const [formOpen, setFormOpen] = useState(false);

  const handleDelete = async (issue) => {
    if (!window.confirm(`Hapus issue "${issue.title}"?`)) return;
    try {
      await deleteMut.mutateAsync(issue.id);
      setViewing(null);
    } catch (err) {
      window.alert(apiErrorMessage(err, 'Gagal menghapus issue'));
    }
  };

  const onDragStart = (e, issue) => {
    e.dataTransfer.setData('text/plain', String(issue.id));
    e.dataTransfer.effectAllowed = 'move';
    setDraggingId(issue.id);
  };
  const onDragEnd = () => {
    setDraggingId(null);
    setOverCol(null);
  };
  const onDrop = (e, status) => {
    e.preventDefault();
    const id = Number(e.dataTransfer.getData('text/plain'));
    setOverCol(null);
    setDraggingId(null);
    const issue = issues?.find((i) => i.id === id);
    if (issue && issue.status !== status) {
      updateMut.mutate({ id, payload: { status } });
    }
  };

  if (isLoading) return <CenteredSpinner />;
  if (isError) return <ErrorState message={apiErrorMessage(error)} />;

  const byStatus = ISSUE_STATUS_ORDER.reduce((acc, s) => {
    acc[s] = (issues || []).filter((i) => i.status === s);
    return acc;
  }, {});

  return (
    <>
      <PageHeader title="Issue Saya" subtitle="Issue yang ditugaskan ke kamu — geser kartu untuk ubah status" />

      <div className="flex gap-4 overflow-x-auto pb-2">
        {ISSUE_STATUS_ORDER.map((status) => {
          const items = byStatus[status];
          return (
            <div
              key={status}
              onDragOver={(e) => {
                e.preventDefault();
                setOverCol(status);
              }}
              onDragLeave={() => setOverCol((c) => (c === status ? null : c))}
              onDrop={(e) => onDrop(e, status)}
              className={cn(
                'flex w-72 shrink-0 flex-col rounded-xl border-t-4 bg-slate-50 dark:bg-app-fill',
                COLUMN_ACCENT[status],
                overCol === status && 'ring-2 ring-brand-500/40'
              )}
            >
              <div className="flex items-center justify-between px-3 py-2.5">
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{ISSUE_STATUS[status].label}</span>
                <span className="rounded-full bg-slate-200 px-2 text-xs font-medium text-slate-600 dark:bg-elevated dark:text-slate-300">
                  {items.length}
                </span>
              </div>
              <div className="flex min-h-[120px] flex-col gap-2 px-2.5 pb-3">
                {items.length === 0 ? (
                  <p className="py-6 text-center text-xs text-slate-400">Kosong</p>
                ) : (
                  items.map((issue) => (
                    <IssueCard
                      key={issue.id}
                      issue={issue}
                      dragging={draggingId === issue.id}
                      onDragStart={onDragStart}
                      onDragEnd={onDragEnd}
                      onClick={setViewing}
                    />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      <IssueDetailModal
        open={!!viewing}
        onClose={() => setViewing(null)}
        issue={viewing}
        canWrite={canWrite}
        canDelete={canDelete}
        onEdit={(i) => {
          setViewing(null);
          setEditing(i);
          setFormOpen(true);
        }}
        onDelete={handleDelete}
      />
      <IssueFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        moduleId={editing?.module_id}
        issue={editing}
      />
    </>
  );
}
