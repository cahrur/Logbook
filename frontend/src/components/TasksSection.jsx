import { useState } from 'react';
import { Plus, User, CalendarDays, Trash2, Pencil, ClipboardList } from 'lucide-react';
import { cn } from '@/lib/cn';
import { useModuleTasks, useUpdateTask, useDeleteTask } from '@/hooks/useTasks';
import { CenteredSpinner, EmptyState } from '@/components/ui/Misc';
import { Button } from '@/components/ui/Button';
import { TASK_STATUS, TASK_STATUS_ORDER } from '@/components/ui/Badge';
import { TaskFormModal } from '@/components/TaskFormModal';
import { TaskDetailModal } from '@/components/TaskDetailModal';
import { formatDate } from '@/lib/format';
import { overdueDays } from '@/lib/schedule';
import { apiErrorMessage } from '@/lib/api';

// Incomplete tasks first, done sink to the bottom; newest first within a group.
function sortTasks(tasks) {
  return [...tasks].sort(
    (a, b) => (a.status === 'done') - (b.status === 'done') || b.id - a.id
  );
}

const SELECT_CLASS =
  'rounded-md border border-slate-300 bg-white px-2 py-1 text-xs font-medium text-slate-700 focus:border-brand-500 focus:outline-none dark:border-line dark:bg-secondary dark:text-slate-200';

function TaskRow({ task, canWrite, canDelete, onView, onEdit, onDelete }) {
  const updateMut = useUpdateTask();
  const done = task.status === 'done';
  const overdue = overdueDays(task.deadline, done);
  const st = TASK_STATUS[task.status] || TASK_STATUS.todo;

  const changeStatus = (e) => {
    updateMut.mutate({ id: task.id, payload: { status: e.target.value } });
  };

  return (
    <div className="flex items-start justify-between gap-3 p-3">
      <button
        onClick={() => onView(task)}
        className="min-w-0 flex-1 rounded text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40"
        title="Lihat detail"
      >
        <p className={cn('font-medium', done ? 'text-slate-400 line-through dark:text-slate-500' : 'text-slate-800 dark:text-slate-100')}>
          {task.title}
        </p>
        {task.detail && (
          <p className={cn('mt-0.5 line-clamp-1 text-sm', done ? 'text-slate-400 line-through' : 'text-slate-500 dark:text-slate-400')}>
            {task.detail}
          </p>
        )}
        <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400">
          <span className="inline-flex items-center gap-1">
            <User className="h-3 w-3" />
            {task.assignee_name || 'Belum ditugaskan'}
          </span>
          {task.deadline && (
            <span className={cn('inline-flex items-center gap-1', overdue > 0 ? 'font-medium text-red-600 dark:text-red-400' : '')}>
              <CalendarDays className="h-3 w-3" />
              {formatDate(task.deadline)}
              {overdue > 0 ? ` · telat ${overdue}h` : ''}
            </span>
          )}
        </div>
      </button>

      <div className="flex shrink-0 items-center gap-1.5">
        {canWrite ? (
          <select value={task.status} onChange={changeStatus} className={SELECT_CLASS} aria-label="Ubah status">
            {TASK_STATUS_ORDER.map((s) => (
              <option key={s} value={s}>{TASK_STATUS[s].label}</option>
            ))}
          </select>
        ) : (
          <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600 dark:bg-elevated dark:text-slate-300">{st.label}</span>
        )}
        {canWrite && (
          <button onClick={() => onEdit(task)} className="rounded-md p-1.5 text-slate-400 hover:text-brand-600" aria-label="Edit tugas">
            <Pencil className="h-4 w-4" />
          </button>
        )}
        {canDelete && (
          <button onClick={() => onDelete(task)} className="rounded-md p-1.5 text-slate-400 hover:text-red-600" aria-label="Hapus tugas">
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}

export function TasksSection({ moduleId, canWrite, canDelete }) {
  const { data: tasks, isLoading } = useModuleTasks(moduleId);
  const deleteMut = useDeleteTask();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [viewing, setViewing] = useState(null);

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };
  const openEdit = (t) => {
    setEditing(t);
    setFormOpen(true);
  };
  const handleDelete = async (t) => {
    if (!window.confirm(`Hapus tugas "${t.title}"?`)) return;
    try {
      await deleteMut.mutateAsync(t.id);
    } catch (err) {
      window.alert(apiErrorMessage(err, 'Gagal menghapus tugas'));
    }
  };

  const sorted = tasks ? sortTasks(tasks) : [];

  return (
    <div className="mt-10">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="inline-flex items-center gap-2 text-lg font-semibold text-slate-800 dark:text-slate-100">
          <ClipboardList className="h-5 w-5 text-brand-500" />
          Tugas
        </h2>
        {canWrite && <Button icon={Plus} onClick={openCreate}>Buat Tugas</Button>}
      </div>

      {isLoading ? (
        <CenteredSpinner />
      ) : sorted.length === 0 ? (
        <EmptyState
          title="Belum ada tugas"
          description="Buat tugas dan tugaskan ke anggota tim."
          action={canWrite && <Button icon={Plus} onClick={openCreate}>Buat Tugas</Button>}
        />
      ) : (
        <div className="max-h-[520px] divide-y divide-slate-100 overflow-y-auto rounded-xl border border-slate-200 bg-white dark:divide-line/50 dark:border-line dark:bg-secondary">
          {sorted.map((task) => (
            <TaskRow
              key={task.id}
              task={task}
              canWrite={canWrite}
              canDelete={canDelete}
              onView={setViewing}
              onEdit={openEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      <TaskDetailModal
        open={!!viewing}
        onClose={() => setViewing(null)}
        task={viewing}
        canWrite={canWrite}
        canDelete={canDelete}
        onEdit={(t) => {
          setViewing(null);
          openEdit(t);
        }}
        onDelete={(t) => {
          setViewing(null);
          handleDelete(t);
        }}
      />
      <TaskFormModal open={formOpen} onClose={() => setFormOpen(false)} moduleId={moduleId} task={editing} />
    </div>
  );
}
