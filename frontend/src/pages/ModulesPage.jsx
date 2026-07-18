import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useModules, useDeleteModule } from '@/hooks/useModules';
import { useAuth } from '@/context/AuthContext';
import { PageHeader, CenteredSpinner, ErrorState, EmptyState } from '@/components/ui/Misc';
import { Card, ProgressBar } from '@/components/ui/Card';
import { Badge, MODULE_STATUS } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ModuleFormModal } from '@/components/ModuleFormModal';
import { apiErrorMessage } from '@/lib/api';

export default function ModulesPage() {
  const { data: modules, isLoading, isError, error } = useModules();
  const { canWrite, canDelete } = useAuth();
  const deleteMut = useDeleteModule();
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const openCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };
  const openEdit = (m) => {
    setEditing(m);
    setModalOpen(true);
  };

  const handleDelete = async (m) => {
    if (!window.confirm(`Hapus modul "${m.name}"? Aktivitas terkait tidak ikut terhapus.`)) return;
    try {
      await deleteMut.mutateAsync(m.id);
    } catch (err) {
      window.alert(apiErrorMessage(err, 'Gagal menghapus modul'));
    }
  };

  if (isLoading) return <CenteredSpinner />;
  if (isError) return <ErrorState message={apiErrorMessage(error)} />;

  return (
    <>
      <PageHeader
        title="Modul"
        subtitle="Unit kerja proyek — klik untuk melihat detail"
        actions={canWrite && <Button icon={Plus} onClick={openCreate}>Tambah Modul</Button>}
      />

      {modules.length === 0 ? (
        <EmptyState
          title="Belum ada modul"
          description="Mulai dengan menambahkan modul pertama proyekmu."
          action={canWrite && <Button icon={Plus} onClick={openCreate}>Tambah Modul</Button>}
        />
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {modules.map((m) => {
            const st = MODULE_STATUS[m.status] || MODULE_STATUS.planned;
            return (
              <Card key={m.id} className="flex flex-col p-4">
                <div className="flex items-start justify-between gap-2">
                  <button
                    className="min-w-0 text-left"
                    onClick={() => navigate(`/modules/${m.id}`)}
                  >
                    <p className="truncate font-semibold text-slate-800 hover:text-brand-600 dark:text-slate-100">{m.name}</p>
                    <p className="text-xs text-slate-400">
                      {m.pic_name ? `PIC: ${m.pic_name}` : 'PIC belum ditentukan'} · {m.activity_count} aktivitas
                    </p>
                  </button>
                  <Badge tone={st.tone}>{st.label}</Badge>
                </div>

                {m.description && (
                  <p className="mt-2 line-clamp-2 text-sm text-slate-500 dark:text-slate-400">{m.description}</p>
                )}

                <div className="mt-3 flex items-center gap-3">
                  <ProgressBar value={m.progress} amber={m.status === 'on_hold'} />
                  <span className="w-10 text-right text-xs font-medium tabular-nums text-slate-500 dark:text-slate-400">
                    {m.progress}%
                  </span>
                </div>

                {canWrite && (
                  <div className="mt-3 flex justify-end gap-1 border-t border-slate-100 pt-3 dark:border-line">
                    <Button variant="ghost" size="sm" icon={Pencil} onClick={() => openEdit(m)}>
                      Edit
                    </Button>
                    {canDelete && (
                      <Button variant="ghost" size="sm" icon={Trash2} onClick={() => handleDelete(m)} className="text-red-500 hover:text-red-600">
                        Hapus
                      </Button>
                    )}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      <ModuleFormModal open={modalOpen} onClose={() => setModalOpen(false)} module={editing} />
    </>
  );
}
