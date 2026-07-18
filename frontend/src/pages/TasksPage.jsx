import { useState } from 'react';
import { Boxes, CalendarDays } from 'lucide-react';
import { cn } from '@/lib/cn';
import { useAuth } from '@/context/AuthContext';
import { useMyTasks, useUpdateTask, useDeleteTask } from '@/hooks/useTasks';
import { PageHeader, CenteredSpinner, ErrorState } from '@/components/ui/Misc';
import { TASK_STATUS, TASK_STATUS_ORDER } from '@/components/ui/Badge';
import { TaskDetailModal } from '@/components/TaskDetailModal';
import { TaskFormModal } from '@/components/TaskFormModal';
import { formatDate } from '@/lib/format';
import { overdueDays } from '@/lib/schedule';
import { apiErrorMessage } from '@/lib/api';

const COLUMN_ACCENT = {
  todo: 'border-t-slate-400',
  in_progress: 'border-t-blue-500',
  review: 'border-t-amber-500',
  done: 'border-t-emerald-500',
};

function TaskCard({ task, onDragStart, onDragEnd, onClick, dragging }) {
  const done = task.status === 'done';
  const overdue = overdueDays(task.deadline, done);
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, task)}
      onDragEnd={onDragEnd}
      onClick={() => onClick(task)}
      className={cn(
        'cursor-grab rounded-lg border border-slate-200 bg-white p-3 shadow-sm transition-colors hover:border-brand-300 active:cursor-grabbing dark:border-line dark:bg-secondary dark:hover:border-brand-600',
        dragging && 'opacity-40'
      )}
    >
      <p className={cn('text-sm font-medium', done ? 'text-slate-400 line-through dark:text-slate-500' : 'text-slate-800 dark:text-slate-100')}>
        {task.title}
      </p>
      {task.module_name && (
        <span className="mt-1.5 inline-flex items-center gap-1 rounded bg-brand-50 px-1.5 py-0.5 text-[0.66rem] font-medium text-brand-600 dark:bg-brand-700/30 dark:text-brand-200">
          <Boxes className="h-3 w-3" />
          {task.module_name}
        </span>
      )}
      {task.deadline && (
        <div className={cn('mt-1.5 flex items-center gap-1 text-xs', overdue > 0 ? 'font-medium text-red-600 dark:text-red-400' : 'text-slate-400')}>
          <CalendarDays className="h-3 w-3" />
          {formatDate(task.deadline)}
          {overdue > 0 ? ` · telat ${overdue}h` : ''}
        </div>
      )}
    </div>
  );
}

export default function TasksPage() {
  const { user, canWrite, canDelete } = useAuth();
  const { data: tasks, isLoading, isError, error } = useMyTasks(user?.id);
  const updateMut = useUpdateTask();
  const deleteMut = useDeleteTask();
  const [draggingId, setDraggingId] = useState(null);
  const [overCol, setOverCol] = useState(null);
  const [viewing, setViewing] = useState(null);
  const [editing, setEditing] = useState(null);
  const [formOpen, setFormOpen] = useState(false);

  const handleDelete = async (task) => {
    if (!window.confirm(`Hapus tugas "${task.title}"?`)) return;
    try {
      await deleteMut.mutateAsync(task.id);
      setViewing(null);
    } catch (err) {
      window.alert(apiErrorMessage(err, 'Gagal menghapus tugas'));
    }
  };

  const onDragStart = (e, task) => {
    e.dataTransfer.setData('text/plain', String(task.id));
    e.dataTransfer.effectAllowed = 'move';
    setDraggingId(task.id);
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
    const task = tasks?.find((t) => t.id === id);
    if (task && task.status !== status) {
      updateMut.mutate({ id, payload: { status } });
    }
  };

  if (isLoading) return <CenteredSpinner />;
  if (isError) return <ErrorState message={apiErrorMessage(error)} />;

  const byStatus = TASK_STATUS_ORDER.reduce((acc, s) => {
    acc[s] = (tasks || []).filter((t) => t.status === s);
    return acc;
  }, {});

  return (
    <>
      <PageHeader title="Tugas Saya" subtitle="Tugas yang ditugaskan ke kamu — geser kartu untuk ubah status" />

      <div className="flex gap-4 overflow-x-auto pb-2">
        {TASK_STATUS_ORDER.map((status) => {
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
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{TASK_STATUS[status].label}</span>
                <span className="rounded-full bg-slate-200 px-2 text-xs font-medium text-slate-600 dark:bg-elevated dark:text-slate-300">
                  {items.length}
                </span>
              </div>
              <div className="flex min-h-[120px] flex-col gap-2 px-2.5 pb-3">
                {items.length === 0 ? (
                  <p className="py-6 text-center text-xs text-slate-400">Kosong</p>
                ) : (
                  items.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      dragging={draggingId === task.id}
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

      <TaskDetailModal
        open={!!viewing}
        onClose={() => setViewing(null)}
        task={viewing}
        canWrite={canWrite}
        canDelete={canDelete}
        onEdit={(t) => {
          setViewing(null);
          setEditing(t);
          setFormOpen(true);
        }}
        onDelete={handleDelete}
      />
      <TaskFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        moduleId={editing?.module_id}
        task={editing}
      />
    </>
  );
}
