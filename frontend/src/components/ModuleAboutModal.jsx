import { useEffect, useState } from 'react';
import { Pencil } from 'lucide-react';
import { cn } from '@/lib/cn';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Markdown } from '@/components/ui/Markdown';
import { useUpdateModule } from '@/hooks/useModules';
import { apiErrorMessage } from '@/lib/api';

function TabButton({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        '-mb-px border-b-2 px-3 py-1.5 text-sm font-medium transition-colors',
        active
          ? 'border-brand-500 text-brand-600 dark:text-brand-300'
          : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'
      )}
    >
      {children}
    </button>
  );
}

const PLACEHOLDER = `# Tentang Modul Ini

Jelaskan tujuan, ruang lingkup, dan hal penting modul ini.

## Fitur
- Poin pertama
- Poin kedua

## Catatan
Gunakan **tebal**, _miring_, \`kode\`, tabel, dan checklist:

- [x] Sudah selesai
- [ ] Belum selesai`;

export function ModuleAboutModal({ open, onClose, module: mod, canWrite }) {
  const [editMode, setEditMode] = useState(false);
  const [tab, setTab] = useState('write'); // within edit: 'write' | 'preview'
  const [value, setValue] = useState('');
  const [error, setError] = useState('');
  const updateMut = useUpdateModule();

  useEffect(() => {
    if (open) {
      setValue(mod?.about || '');
      setEditMode(false);
      setTab('write');
      setError('');
    }
  }, [open, mod]);

  if (!mod) return null;

  const startEdit = () => {
    setValue(mod?.about || '');
    setTab('write');
    setError('');
    setEditMode(true);
  };

  const cancelEdit = () => {
    setValue(mod?.about || '');
    setError('');
    setEditMode(false);
  };

  const save = async () => {
    setError('');
    try {
      await updateMut.mutateAsync({ id: mod.id, payload: { about: value.trim() || null } });
      setEditMode(false);
    } catch (err) {
      setError(apiErrorMessage(err, 'Gagal menyimpan penjelasan'));
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`About — ${mod.name}`}
      size="xl"
      footer={
        editMode ? (
          <>
            <Button variant="secondary" onClick={cancelEdit}>Batal</Button>
            <Button onClick={save} loading={updateMut.isPending}>Simpan</Button>
          </>
        ) : (
          <>
            <Button variant="secondary" onClick={onClose}>Tutup</Button>
            {canWrite && <Button icon={Pencil} onClick={startEdit}>Edit</Button>}
          </>
        )
      }
    >
      {!editMode ? (
        // Preview mode — rendered markdown.
        value ? (
          <Markdown>{value}</Markdown>
        ) : (
          <p className="text-sm italic text-slate-400">
            Belum ada penjelasan untuk modul ini.
            {canWrite ? ' Klik Edit untuk menambahkan.' : ''}
          </p>
        )
      ) : (
        // Edit mode — write / preview tabs.
        <div>
          <div className="mb-3 flex items-center gap-1 border-b border-slate-200 dark:border-line">
            <TabButton active={tab === 'write'} onClick={() => setTab('write')}>Tulis</TabButton>
            <TabButton active={tab === 'preview'} onClick={() => setTab('preview')}>Pratinjau</TabButton>
            <span className="ml-auto self-center pr-1 text-xs text-slate-400">Mendukung Markdown (GitHub)</span>
          </div>

          {tab === 'write' ? (
            <textarea
              value={value}
              onChange={(e) => setValue(e.target.value)}
              rows={16}
              spellCheck={false}
              placeholder={PLACEHOLDER}
              className="min-h-[320px] w-full rounded-lg border border-slate-300 bg-white p-3 font-mono text-sm leading-relaxed text-slate-800 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-line dark:bg-primary dark:text-slate-100"
            />
          ) : (
            <div className="min-h-[320px] rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-line dark:bg-primary/50">
              {value ? <Markdown>{value}</Markdown> : <p className="text-sm italic text-slate-400">Belum ada yang ditulis.</p>}
            </div>
          )}

          {error && <p className="mt-2 text-sm text-red-500" role="alert">{error}</p>}
        </div>
      )}
    </Modal>
  );
}
