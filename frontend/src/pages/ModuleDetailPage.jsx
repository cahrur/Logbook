import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Plus, Pencil, Info, CalendarDays, Target } from 'lucide-react';
import { cn } from '@/lib/cn';
import { useModule } from '@/hooks/useModules';
import { useActivities, useDeleteActivity } from '@/hooks/useActivities';
import { useAuth } from '@/context/AuthContext';
import { PageHeader, CenteredSpinner, ErrorState } from '@/components/ui/Misc';
import { Card, ProgressBar } from '@/components/ui/Card';
import { Badge, MODULE_STATUS } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ActivityTimeline } from '@/components/ActivityTimeline';
import { ActivityFormModal } from '@/components/ActivityFormModal';
import { ActivityDetailModal } from '@/components/ActivityDetailModal';
import { ModuleFormModal } from '@/components/ModuleFormModal';
import { ModuleAboutModal } from '@/components/ModuleAboutModal';
import { RoadmapSection } from '@/components/RoadmapSection';
import { TasksSection } from '@/components/TasksSection';
import { FilesSection } from '@/components/FilesSection';
import { apiErrorMessage } from '@/lib/api';
import { formatDate } from '@/lib/format';
import { overdueDays } from '@/lib/schedule';

export default function ModuleDetailPage() {
  const { id } = useParams();
  const moduleId = Number(id);
  const { canWrite, canDelete } = useAuth();
  const { data: mod, isLoading, isError, error } = useModule(id);
  const { data: activities } = useActivities({ module_id: moduleId });
  const deleteMut = useDeleteActivity();

  const [activityModal, setActivityModal] = useState(false);
  const [editingActivity, setEditingActivity] = useState(null);
  const [viewingActivity, setViewingActivity] = useState(null);
  const [moduleModal, setModuleModal] = useState(false);
  const [aboutModal, setAboutModal] = useState(false);

  const openCreate = () => {
    setEditingActivity(null);
    setActivityModal(true);
  };
  const openEdit = (a) => {
    setEditingActivity(a);
    setActivityModal(true);
  };
  const handleDelete = async (a) => {
    if (!window.confirm('Hapus aktivitas ini?')) return;
    try {
      await deleteMut.mutateAsync(a.id);
    } catch (err) {
      window.alert(apiErrorMessage(err, 'Gagal menghapus'));
    }
  };

  if (isLoading) return <CenteredSpinner />;
  if (isError) return <ErrorState message={apiErrorMessage(error)} />;

  const st = MODULE_STATUS[mod.status] || MODULE_STATUS.planned;
  const overdue = overdueDays(mod.target_date, mod.status === 'done');

  return (
    <>
      <PageHeader
        title={mod.name}
        subtitle={mod.pic_name ? `PIC: ${mod.pic_name}` : 'PIC belum ditentukan'}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="secondary" icon={Info} onClick={() => setAboutModal(true)}>About</Button>
            {canWrite && <Button variant="secondary" icon={Pencil} onClick={() => setModuleModal(true)}>Edit Modul</Button>}
            {canWrite && <Button icon={Plus} onClick={openCreate}>Catat Aktivitas</Button>}
          </div>
        }
      />

      <Card className="p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={st.tone}>{st.label}</Badge>
            {overdue > 0 && <Badge tone="bad">Telat {overdue} hari</Badge>}
          </div>
          <span className="text-sm font-medium tabular-nums text-slate-500 dark:text-slate-400">{mod.progress}% selesai</span>
        </div>
        <div className="mt-3">
          <ProgressBar value={mod.progress} amber={mod.status === 'on_hold' || overdue > 0} />
        </div>

        {(mod.start_date || mod.target_date) && (
          <div className="mt-4 flex flex-wrap gap-x-6 gap-y-1.5 text-sm">
            <span className="inline-flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
              <CalendarDays className="h-4 w-4" />
              Mulai: <span className="font-medium text-slate-700 dark:text-slate-200">{mod.start_date ? formatDate(mod.start_date) : '—'}</span>
            </span>
            <span
              className={cn(
                'inline-flex items-center gap-1.5',
                overdue > 0 ? 'font-medium text-red-600 dark:text-red-400' : 'text-slate-500 dark:text-slate-400'
              )}
            >
              <Target className="h-4 w-4" />
              Target selesai: <span className="font-medium">{mod.target_date ? formatDate(mod.target_date) : '—'}</span>
              {overdue > 0 && ` · overtime ${overdue} hari`}
            </span>
          </div>
        )}

        {mod.description && <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">{mod.description}</p>}
      </Card>

      <div className="mt-8">
        <h2 className="mb-3 text-lg font-semibold text-slate-800 dark:text-slate-100">
          Aktivitas Modul {activities ? `(${activities.length})` : ''}
        </h2>
        <ActivityTimeline
          moduleId={moduleId}
          onView={setViewingActivity}
          onEdit={canWrite ? openEdit : undefined}
          onDelete={canDelete ? handleDelete : undefined}
        />
      </div>

      <RoadmapSection moduleId={moduleId} canWrite={canWrite} canDelete={canDelete} />

      <TasksSection moduleId={moduleId} canWrite={canWrite} canDelete={canDelete} />

      <FilesSection moduleId={moduleId} canWrite={canWrite} canDelete={canDelete} />

      <ActivityDetailModal
        open={!!viewingActivity}
        onClose={() => setViewingActivity(null)}
        activity={viewingActivity}
        canWrite={canWrite}
        onEdit={(a) => {
          setViewingActivity(null);
          openEdit(a);
        }}
      />
      <ActivityFormModal
        open={activityModal}
        onClose={() => setActivityModal(false)}
        activity={editingActivity}
        defaultModuleId={moduleId}
      />
      <ModuleFormModal open={moduleModal} onClose={() => setModuleModal(false)} module={mod} />
      <ModuleAboutModal open={aboutModal} onClose={() => setAboutModal(false)} module={mod} canWrite={canWrite} />
    </>
  );
}
