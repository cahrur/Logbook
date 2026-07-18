import { useState } from 'react';
import { Plus, Check, Milestone, ChevronRight, CalendarDays } from 'lucide-react';
import { cn } from '@/lib/cn';
import { useRoadmap, useDeleteRoadmap } from '@/hooks/useRoadmap';
import { CenteredSpinner, EmptyState } from '@/components/ui/Misc';
import { Badge, MODULE_STATUS } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { RoadmapFormModal } from '@/components/RoadmapFormModal';
import { RoadmapStepDetailModal } from '@/components/RoadmapStepDetailModal';
import { formatDate } from '@/lib/format';
import { roadmapOverdue } from '@/lib/roadmap';
import { apiErrorMessage } from '@/lib/api';

function nodeClass(step, overdue) {
  if (overdue) return 'bg-red-500 text-white';
  if (step.status === 'done') return 'bg-brand-500 text-white';
  if (step.status === 'in_progress') {
    return 'border-2 border-brand-500 bg-white text-brand-600 dark:bg-secondary dark:text-brand-300';
  }
  return 'bg-slate-200 text-slate-500 dark:bg-elevated dark:text-slate-300';
}

function StepColumn({ step, index, isFirst, isLast, onView }) {
  const st = MODULE_STATUS[step.status] || MODULE_STATUS.planned;
  const overdue = roadmapOverdue(step);

  return (
    <div className="flex w-[240px] shrink-0 flex-col">
      {/* rail band: line + node + arrow (node centered over the card) */}
      <div className="relative h-16">
        <div
          className="absolute top-[31px] h-0.5 bg-brand-500/30"
          style={{ left: isFirst ? '50%' : 0, right: isLast ? '50%' : 0 }}
        />
        <div
          className={cn(
            'absolute left-1/2 top-3 z-10 flex h-9 w-9 -translate-x-1/2 items-center justify-center rounded-full text-sm font-bold ring-4 ring-white dark:ring-secondary',
            nodeClass(step, overdue)
          )}
        >
          {step.status === 'done' ? <Check className="h-4 w-4" /> : index + 1}
        </div>
        {!isLast && (
          <ChevronRight className="absolute right-0 top-[22px] z-20 h-[18px] w-[18px] translate-x-1/2 text-brand-500" strokeWidth={2.4} />
        )}
      </div>

      {/* clickable card */}
      <button
        onClick={() => onView(step)}
        className="mx-2 flex-1 rounded-lg border border-slate-200 bg-white p-3 text-left transition-colors hover:border-brand-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40 dark:border-line dark:bg-secondary dark:hover:border-brand-600"
      >
        <div className="mb-1.5 flex items-center justify-between gap-2">
          <span className="text-[0.62rem] font-bold uppercase tracking-wide text-slate-400">Step {index + 1}</span>
          {overdue ? <Badge tone="bad">Telat {overdue}h</Badge> : <Badge tone={st.tone}>{st.label}</Badge>}
        </div>
        <p className="line-clamp-2 font-medium leading-snug text-slate-800 dark:text-slate-100">{step.title}</p>
        <div
          className={cn(
            'mt-1.5 inline-flex items-center gap-1 text-xs font-medium',
            overdue ? 'text-red-600 dark:text-red-400' : 'text-slate-400'
          )}
        >
          <CalendarDays className="h-3 w-3" />
          {step.target_date ? `Target ${formatDate(step.target_date)}` : 'Tanpa target'}
        </div>
        {step.description && (
          <p className="mt-1.5 line-clamp-2 text-sm text-slate-500 dark:text-slate-400">{step.description}</p>
        )}
      </button>
    </div>
  );
}

export function RoadmapSection({ moduleId, canWrite, canDelete }) {
  const { data: steps, isLoading } = useRoadmap(moduleId);
  const deleteMut = useDeleteRoadmap(moduleId);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [viewing, setViewing] = useState(null);

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };
  const openEdit = (s) => {
    setEditing(s);
    setFormOpen(true);
  };
  const handleDelete = async (s) => {
    if (!window.confirm(`Hapus step "${s.title}"?`)) return;
    try {
      await deleteMut.mutateAsync(s.id);
      setViewing(null);
    } catch (err) {
      window.alert(apiErrorMessage(err, 'Gagal menghapus step'));
    }
  };

  const nextOrder = steps && steps.length ? Math.max(...steps.map((s) => s.order_index)) + 1 : 0;

  return (
    <div className="mt-10">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="inline-flex items-center gap-2 text-lg font-semibold text-slate-800 dark:text-slate-100">
          <Milestone className="h-5 w-5 text-brand-500" />
          Roadmap
        </h2>
        {canWrite && <Button icon={Plus} onClick={openCreate}>Tambah Step</Button>}
      </div>

      {isLoading ? (
        <CenteredSpinner />
      ) : !steps || steps.length === 0 ? (
        <EmptyState
          title="Belum ada roadmap"
          description="Susun tahapan modul ini sebagai langkah berurutan."
          action={canWrite && <Button icon={Plus} onClick={openCreate}>Tambah Step</Button>}
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-line dark:bg-secondary">
          <div className="overflow-x-auto overflow-y-hidden px-1 pb-3">
            <div className="flex min-w-min items-stretch">
              {steps.map((step, i) => (
                <StepColumn
                  key={step.id}
                  step={step}
                  index={i}
                  isFirst={i === 0}
                  isLast={i === steps.length - 1}
                  onView={setViewing}
                />
              ))}
            </div>
          </div>
          <p className="px-4 pb-2 text-right text-[0.72rem] text-slate-400">← geser untuk lihat step lain →</p>
        </div>
      )}

      <RoadmapStepDetailModal
        open={!!viewing}
        onClose={() => setViewing(null)}
        step={viewing}
        canWrite={canWrite}
        canDelete={canDelete}
        onEdit={(s) => {
          setViewing(null);
          openEdit(s);
        }}
        onDelete={handleDelete}
      />
      <RoadmapFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        moduleId={moduleId}
        step={editing}
        nextOrder={nextOrder}
      />
    </div>
  );
}
