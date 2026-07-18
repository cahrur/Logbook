import { useState } from 'react';
import { Plus, Bug, User, CalendarDays, Trash2, Pencil } from 'lucide-react';
import { cn } from '@/lib/cn';
import { useModuleIssues, useUpdateIssue, useDeleteIssue } from '@/hooks/useIssues';
import { CenteredSpinner, EmptyState } from '@/components/ui/Misc';
import { Button } from '@/components/ui/Button';
import { Badge, ISSUE_PRIORITY, ISSUE_STATUS, ISSUE_STATUS_ORDER } from '@/components/ui/Badge';
import { IssueFormModal } from '@/components/IssueFormModal';
import { IssueDetailModal } from '@/components/IssueDetailModal';
import { formatDate } from '@/lib/format';
import { overdueDays } from '@/lib/schedule';
import { apiErrorMessage } from '@/lib/api';

// Open/in-progress first, resolved/closed sink; newest first within a group.
function sortIssues(issues) {
  const done = (s) => s === 'resolved' || s === 'closed';
  return [...issues].sort((a, b) => done(a.status) - done(b.status) || b.id - a.id);
}

const SELECT_CLASS =
  'rounded-md border border-slate-300 bg-white px-2 py-1 text-xs font-medium text-slate-700 focus:border-brand-500 focus:outline-none dark:border-line dark:bg-secondary dark:text-slate-200';

function IssueRow({ issue, moduleId, canWrite, canDelete, onView, onEdit, onDelete }) {
  const updateMut = useUpdateIssue(moduleId);
  const prio = ISSUE_PRIORITY[issue.priority] || ISSUE_PRIORITY.medium;
  const closed = issue.status === 'resolved' || issue.status === 'closed';
  const overdue = overdueDays(issue.deadline, closed);

  const changeStatus = (e) => updateMut.mutate({ id: issue.id, payload: { status: e.target.value } });

  return (
    <div className="flex items-start justify-between gap-3 p-3">
      <button
        onClick={() => onView(issue)}
        className="min-w-0 flex-1 rounded text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40"
        title="Lihat detail"
      >
        <div className="mb-1 flex flex-wrap items-center gap-2">
          <Badge tone={prio.tone}>{prio.label}</Badge>
          <p className={cn('font-medium', closed ? 'text-slate-400 line-through dark:text-slate-500' : 'text-slate-800 dark:text-slate-100')}>
            {issue.title}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400">
          <span className="inline-flex items-center gap-1">
            <User className="h-3 w-3" />
            {issue.assignee_name || 'Belum ditugaskan'}
          </span>
          {issue.deadline && (
            <span className={cn('inline-flex items-center gap-1', overdue > 0 ? 'font-medium text-red-600 dark:text-red-400' : '')}>
              <CalendarDays className="h-3 w-3" />
              {formatDate(issue.deadline)}
              {overdue > 0 ? ` · telat ${overdue}h` : ''}
            </span>
          )}
        </div>
      </button>

      <div className="flex shrink-0 items-center gap-1.5">
        {canWrite ? (
          <select value={issue.status} onChange={changeStatus} className={SELECT_CLASS} aria-label="Ubah status">
            {ISSUE_STATUS_ORDER.map((s) => (
              <option key={s} value={s}>{ISSUE_STATUS[s].label}</option>
            ))}
          </select>
        ) : (
          <Badge tone={(ISSUE_STATUS[issue.status] || ISSUE_STATUS.open).tone}>
            {(ISSUE_STATUS[issue.status] || ISSUE_STATUS.open).label}
          </Badge>
        )}
        {canWrite && (
          <button onClick={() => onEdit(issue)} className="rounded-md p-1.5 text-slate-400 hover:text-brand-600" aria-label="Edit issue">
            <Pencil className="h-4 w-4" />
          </button>
        )}
        {canDelete && (
          <button onClick={() => onDelete(issue)} className="rounded-md p-1.5 text-slate-400 hover:text-red-600" aria-label="Hapus issue">
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}

export function IssueSection({ moduleId, canWrite, canDelete }) {
  const { data: issues, isLoading } = useModuleIssues(moduleId);
  const deleteMut = useDeleteIssue(moduleId);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [viewing, setViewing] = useState(null);

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };
  const openEdit = (i) => {
    setEditing(i);
    setFormOpen(true);
  };
  const handleDelete = async (i) => {
    if (!window.confirm(`Hapus issue "${i.title}"?`)) return;
    try {
      await deleteMut.mutateAsync(i.id);
    } catch (err) {
      window.alert(apiErrorMessage(err, 'Gagal menghapus issue'));
    }
  };

  const sorted = issues ? sortIssues(issues) : [];

  return (
    <div className="mt-10">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="inline-flex items-center gap-2 text-lg font-semibold text-slate-800 dark:text-slate-100">
          <Bug className="h-5 w-5 text-brand-500" />
          Issue
        </h2>
        {canWrite && <Button icon={Plus} onClick={openCreate}>Tambah Issue</Button>}
      </div>

      {isLoading ? (
        <CenteredSpinner />
      ) : sorted.length === 0 ? (
        <EmptyState
          title="Belum ada issue"
          description="Laporkan bug atau kendala yang ditemukan di modul ini."
          action={canWrite && <Button icon={Plus} onClick={openCreate}>Tambah Issue</Button>}
        />
      ) : (
        <div className="max-h-[520px] divide-y divide-slate-100 overflow-y-auto rounded-xl border border-slate-200 bg-white dark:divide-line/50 dark:border-line dark:bg-secondary">
          {sorted.map((issue) => (
            <IssueRow
              key={issue.id}
              issue={issue}
              moduleId={moduleId}
              canWrite={canWrite}
              canDelete={canDelete}
              onView={setViewing}
              onEdit={openEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      <IssueDetailModal
        open={!!viewing}
        onClose={() => setViewing(null)}
        issue={viewing}
        canWrite={canWrite}
        canDelete={canDelete}
        onEdit={(i) => {
          setViewing(null);
          openEdit(i);
        }}
        onDelete={(i) => {
          setViewing(null);
          handleDelete(i);
        }}
      />
      <IssueFormModal open={formOpen} onClose={() => setFormOpen(false)} moduleId={moduleId} issue={editing} />
    </div>
  );
}
