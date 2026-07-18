import { useRef, useState } from 'react';
import {
  FileText, FileSpreadsheet, FileImage, File, Upload, Trash2,
  ExternalLink, Download, Loader2,
} from 'lucide-react';
import { useFiles, useUploadFile, useDeleteFile } from '@/hooks/useFiles';
import { fileService } from '@/services/file.service';
import { CenteredSpinner, EmptyState } from '@/components/ui/Misc';
import { Button } from '@/components/ui/Button';
import { formatDate, formatBytes } from '@/lib/format';
import { apiErrorMessage } from '@/lib/api';
import { ACCEPT_ATTR, isAcceptedFile, fileGroup, isPreviewable } from '@/lib/fileTypes';

// Icon + accent color per file group.
const GROUP_STYLE = {
  pdf: { Icon: FileText, cls: 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400' },
  excel: { Icon: FileSpreadsheet, cls: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' },
  word: { Icon: FileText, cls: 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' },
  image: { Icon: FileImage, cls: 'bg-violet-50 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400' },
  svg: { Icon: FileImage, cls: 'bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' },
  ai: { Icon: FileImage, cls: 'bg-orange-50 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400' },
  other: { Icon: File, cls: 'bg-slate-100 text-slate-500 dark:bg-slate-700/50 dark:text-slate-300' },
};

export function FilesSection({ moduleId, canWrite, canDelete }) {
  const { data: files, isLoading } = useFiles(moduleId);
  const uploadMut = useUploadFile(moduleId);
  const deleteMut = useDeleteFile(moduleId);
  const inputRef = useRef(null);
  const [error, setError] = useState('');
  const [openingId, setOpeningId] = useState(null);

  const pickFile = () => inputRef.current?.click();

  const onFileChange = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // allow re-selecting the same file later
    if (!file) return;
    setError('');
    if (!isAcceptedFile(file.name)) {
      setError('Tipe berkas tidak didukung. Format: PDF, Excel, Word, PNG, JPG, WEBP, SVG, AI.');
      return;
    }
    try {
      await uploadMut.mutateAsync(file);
    } catch (err) {
      setError(apiErrorMessage(err, 'Gagal mengunggah berkas'));
    }
  };

  // Open previewable files (PDF/images) in a new tab. We open the tab
  // synchronously (so it isn't popup-blocked), then point it at the
  // authenticated blob once fetched.
  const openInTab = async (file, blob) => {
    const tab = window.open('', '_blank');
    const url = URL.createObjectURL(blob);
    if (tab) tab.location = url;
    else window.open(url, '_blank');
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  };

  // Download non-previewable files (Office docs, SVG, AI) with their real name.
  const download = (file, blob) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.original_name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  };

  const handleOpen = async (file) => {
    setOpeningId(file.id);
    try {
      const blob = await fileService.fetchBlob(file.id);
      if (isPreviewable(file.original_name)) await openInTab(file, blob);
      else download(file, blob);
    } catch (err) {
      window.alert(apiErrorMessage(err, 'Gagal membuka berkas'));
    } finally {
      setOpeningId(null);
    }
  };

  const handleDelete = async (file) => {
    if (!window.confirm(`Hapus berkas "${file.original_name}"?`)) return;
    try {
      await deleteMut.mutateAsync(file.id);
    } catch (err) {
      window.alert(apiErrorMessage(err, 'Gagal menghapus berkas'));
    }
  };

  return (
    <div className="mt-10">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="inline-flex items-center gap-2 text-lg font-semibold text-slate-800 dark:text-slate-100">
          <FileText className="h-5 w-5 text-brand-500" />
          Berkas
        </h2>
        {canWrite && (
          <>
            <input ref={inputRef} type="file" accept={ACCEPT_ATTR} className="hidden" onChange={onFileChange} />
            <Button icon={Upload} loading={uploadMut.isPending} onClick={pickFile}>Upload Berkas</Button>
          </>
        )}
      </div>

      {error && <p className="mb-3 text-sm text-red-500" role="alert">{error}</p>}

      {isLoading ? (
        <CenteredSpinner />
      ) : !files || files.length === 0 ? (
        <EmptyState
          title="Belum ada berkas"
          description="Unggah dokumen (PDF, Excel, Word) atau gambar (PNG, JPG, WEBP, SVG, AI) terkait modul ini."
          action={canWrite && <Button icon={Upload} onClick={pickFile}>Upload Berkas</Button>}
        />
      ) : (
        <div className="divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-200 bg-white dark:divide-slate-700/50 dark:border-line dark:bg-secondary">
          {files.map((file) => {
            const group = fileGroup(file.original_name);
            const { Icon, cls } = GROUP_STYLE[group.key] || GROUP_STYLE.other;
            const preview = isPreviewable(file.original_name);
            return (
              <div key={file.id} className="flex items-center gap-3 p-3">
                <button
                  onClick={() => handleOpen(file)}
                  className="flex min-w-0 flex-1 items-center gap-3 text-left"
                  title={preview ? 'Buka di tab baru' : 'Unduh berkas'}
                >
                  <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${cls}`}>
                    {openingId === file.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Icon className="h-4 w-4" />}
                  </span>
                  <span className="min-w-0">
                    <span className="flex items-center gap-1.5 font-medium text-slate-800 group-hover:text-brand-600 dark:text-slate-100">
                      <span className="truncate">{file.original_name}</span>
                      {preview
                        ? <ExternalLink className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                        : <Download className="h-3.5 w-3.5 shrink-0 text-slate-400" />}
                    </span>
                    <span className="block text-xs text-slate-400">
                      {group.label} · {formatBytes(file.size_bytes)}
                      {file.uploader_name ? ` · ${file.uploader_name}` : ''} · {formatDate(file.created_at)}
                    </span>
                  </span>
                </button>
                {canDelete && (
                  <button
                    onClick={() => handleDelete(file)}
                    className="shrink-0 rounded-md p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/30"
                    aria-label="Hapus berkas"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
