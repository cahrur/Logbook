import { useRef, useState } from 'react';
import { FileText, Upload, Trash2, ExternalLink, Loader2 } from 'lucide-react';
import { useFiles, useUploadFile, useDeleteFile } from '@/hooks/useFiles';
import { fileService } from '@/services/file.service';
import { CenteredSpinner, EmptyState } from '@/components/ui/Misc';
import { Button } from '@/components/ui/Button';
import { formatDate, formatBytes } from '@/lib/format';
import { apiErrorMessage } from '@/lib/api';

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
    const isPdf =
      file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    if (!isPdf) {
      setError('Hanya file PDF yang diperbolehkan.');
      return;
    }
    try {
      await uploadMut.mutateAsync(file);
    } catch (err) {
      setError(apiErrorMessage(err, 'Gagal mengunggah berkas'));
    }
  };

  // Open the PDF in a new tab. We open the tab synchronously (so it isn't
  // popup-blocked), then point it at the authenticated blob once fetched.
  const openPdf = async (file) => {
    const tab = window.open('', '_blank');
    setOpeningId(file.id);
    try {
      const blob = await fileService.fetchBlob(file.id);
      const url = URL.createObjectURL(blob);
      if (tab) tab.location = url;
      else window.open(url, '_blank');
      setTimeout(() => URL.revokeObjectURL(url), 60000);
    } catch (err) {
      if (tab) tab.close();
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
            <input ref={inputRef} type="file" accept="application/pdf,.pdf" className="hidden" onChange={onFileChange} />
            <Button icon={Upload} loading={uploadMut.isPending} onClick={pickFile}>Upload PDF</Button>
          </>
        )}
      </div>

      {error && <p className="mb-3 text-sm text-red-500" role="alert">{error}</p>}

      {isLoading ? (
        <CenteredSpinner />
      ) : !files || files.length === 0 ? (
        <EmptyState
          title="Belum ada berkas"
          description="Unggah dokumen PDF terkait modul ini (mis. spesifikasi, notulen, kontrak)."
          action={canWrite && <Button icon={Upload} onClick={pickFile}>Upload PDF</Button>}
        />
      ) : (
        <div className="divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-200 bg-white dark:divide-slate-700/50 dark:border-line dark:bg-secondary">
          {files.map((file) => (
            <div key={file.id} className="flex items-center gap-3 p-3">
              <button
                onClick={() => openPdf(file)}
                className="flex min-w-0 flex-1 items-center gap-3 text-left"
                title="Buka di tab baru"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400">
                  {openingId === file.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
                </span>
                <span className="min-w-0">
                  <span className="flex items-center gap-1.5 font-medium text-slate-800 group-hover:text-brand-600 dark:text-slate-100">
                    <span className="truncate">{file.original_name}</span>
                    <ExternalLink className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                  </span>
                  <span className="block text-xs text-slate-400">
                    {formatBytes(file.size_bytes)}
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
          ))}
        </div>
      )}
    </div>
  );
}
