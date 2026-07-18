import { useState } from 'react';
import { Plus, Info, ExternalLink, Pencil, Trash2, Link as LinkIcon } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useModuleInfos, useDeleteInfo } from '@/hooks/useModuleInfos';
import { CenteredSpinner, EmptyState } from '@/components/ui/Misc';
import { Button } from '@/components/ui/Button';
import { InfoFormModal } from '@/components/InfoFormModal';
import { apiErrorMessage } from '@/lib/api';

// Only allow http/https hrefs (defense-in-depth against javascript:/data: links).
function safeHref(link) {
  try {
    const u = new URL(link);
    return u.protocol === 'http:' || u.protocol === 'https:' ? link : '#';
  } catch {
    return '#';
  }
}

export function InfoSection({ moduleId }) {
  const { user, isSuperAdmin } = useAuth();
  const { data: infos, isLoading } = useModuleInfos(moduleId);
  const deleteMut = useDeleteInfo(moduleId);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };
  const openEdit = (info) => {
    setEditing(info);
    setFormOpen(true);
  };
  const handleDelete = async (info) => {
    if (!window.confirm(`Hapus informasi "${info.title}"?`)) return;
    try {
      await deleteMut.mutateAsync(info.id);
    } catch (err) {
      window.alert(apiErrorMessage(err, 'Gagal menghapus informasi'));
    }
  };

  const isOwner = (info) => String(info.created_by) === String(user?.id);

  return (
    <div className="mt-10">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="inline-flex items-center gap-2 text-lg font-semibold text-slate-800 dark:text-slate-100">
          <Info className="h-5 w-5 text-brand-500" />
          Informasi
        </h2>
        <Button icon={Plus} onClick={openCreate}>Tambah Informasi</Button>
      </div>

      {isLoading ? (
        <CenteredSpinner />
      ) : !infos || infos.length === 0 ? (
        <EmptyState
          title="Belum ada informasi"
          description="Tambahkan tautan atau referensi terkait modul ini."
          action={<Button icon={Plus} onClick={openCreate}>Tambah Informasi</Button>}
        />
      ) : (
        <div className="divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-200 bg-white dark:divide-line/50 dark:border-line dark:bg-secondary">
          {infos.map((info) => {
            const owner = isOwner(info);
            return (
              <div key={info.id} className="flex items-start justify-between gap-3 p-3.5">
                <div className="min-w-0">
                  <p className="font-medium text-slate-800 dark:text-slate-100">{info.title}</p>
                  {info.description && (
                    <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">{info.description}</p>
                  )}
                  <a
                    href={safeHref(info.link)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 inline-flex max-w-full items-center gap-1 truncate text-xs text-brand-600 hover:underline dark:text-brand-300"
                    title={info.link}
                  >
                    <LinkIcon className="h-3 w-3 shrink-0" />
                    <span className="truncate">{info.link}</span>
                  </a>
                  {info.creator_name && (
                    <p className="mt-1 text-[0.7rem] text-slate-400">oleh {info.creator_name}</p>
                  )}
                </div>

                <div className="flex shrink-0 items-center gap-1">
                  <a
                    href={safeHref(info.link)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:border-brand-300 hover:text-brand-600 dark:border-line dark:text-slate-300"
                    title="Buka di tab baru"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    Buka
                  </a>
                  {owner && (
                    <button onClick={() => openEdit(info)} className="rounded-md p-1.5 text-slate-400 hover:text-brand-600" aria-label="Edit informasi">
                      <Pencil className="h-4 w-4" />
                    </button>
                  )}
                  {(owner || isSuperAdmin) && (
                    <button onClick={() => handleDelete(info)} className="rounded-md p-1.5 text-slate-400 hover:text-red-600" aria-label="Hapus informasi">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <InfoFormModal open={formOpen} onClose={() => setFormOpen(false)} moduleId={moduleId} info={editing} />
    </div>
  );
}
