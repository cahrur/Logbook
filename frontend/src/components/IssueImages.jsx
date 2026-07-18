import { useRef, useState } from 'react';
import { ImagePlus, X, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { AuthImage } from '@/components/ui/AuthImage';
import { useIssueImages, useUploadIssueImage, useDeleteIssueImage } from '@/hooks/useIssueImages';
import { issueImageService } from '@/services/issueImage.service';
import { apiErrorMessage } from '@/lib/api';

const MAX_BYTES = 2 * 1024 * 1024;

export function IssueImages({ issueId, canWrite }) {
  const { user, isSuperAdmin } = useAuth();
  const { data: images } = useIssueImages(issueId);
  const uploadMut = useUploadIssueImage(issueId);
  const deleteMut = useDeleteIssueImage(issueId);
  const inputRef = useRef(null);
  const [error, setError] = useState('');

  const pick = () => inputRef.current?.click();

  const onChange = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setError('');
    if (!file.type.startsWith('image/')) {
      setError('File harus berupa gambar.');
      return;
    }
    if (file.size > MAX_BYTES) {
      setError('Ukuran gambar maksimal 2MB.');
      return;
    }
    try {
      await uploadMut.mutateAsync(file);
    } catch (err) {
      setError(apiErrorMessage(err, 'Gagal mengunggah gambar'));
    }
  };

  const openFull = async (img) => {
    const tab = window.open('', '_blank');
    try {
      const blob = await issueImageService.fetchBlob(img.id);
      const url = URL.createObjectURL(blob);
      if (tab) tab.location = url;
      setTimeout(() => URL.revokeObjectURL(url), 60000);
    } catch {
      if (tab) tab.close();
    }
  };

  const handleDelete = async (img) => {
    if (!window.confirm('Hapus gambar ini?')) return;
    try {
      await deleteMut.mutateAsync(img.id);
    } catch (err) {
      window.alert(apiErrorMessage(err, 'Gagal menghapus gambar'));
    }
  };

  const canDeleteImg = (img) => isSuperAdmin || String(img.uploaded_by) === String(user?.id);

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Gambar</p>
        {canWrite && (
          <>
            <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={onChange} />
            <button
              type="button"
              onClick={pick}
              disabled={uploadMut.isPending}
              className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-600 hover:border-brand-300 hover:text-brand-600 disabled:opacity-60 dark:border-line dark:text-slate-300"
            >
              {uploadMut.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ImagePlus className="h-3.5 w-3.5" />}
              Upload gambar
            </button>
          </>
        )}
      </div>

      {error && <p className="mb-2 text-xs text-red-500" role="alert">{error}</p>}

      {images && images.length > 0 ? (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {images.map((img) => (
            <div key={img.id} className="group relative">
              <AuthImage
                srcId={img.id}
                alt={img.original_name}
                onClick={() => openFull(img)}
                className="h-24 w-full cursor-pointer rounded-lg border border-slate-200 object-cover dark:border-line"
              />
              {canDeleteImg(img) && (
                <button
                  onClick={() => handleDelete(img)}
                  className="absolute right-1 top-1 rounded-full bg-slate-900/60 p-0.5 text-white opacity-0 transition-opacity group-hover:opacity-100"
                  aria-label="Hapus gambar"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm italic text-slate-400">Belum ada gambar.</p>
      )}
    </div>
  );
}
