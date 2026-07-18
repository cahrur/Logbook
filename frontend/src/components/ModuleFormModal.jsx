import { useEffect, useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { TextInput, TextArea, Select } from '@/components/ui/Field';
import { MODULE_STATUS } from '@/components/ui/Badge';
import { useCreateModule, useUpdateModule } from '@/hooks/useModules';
import { apiErrorMessage } from '@/lib/api';
import { ymd } from '@/lib/format';

const STATUS_OPTIONS = Object.entries(MODULE_STATUS).map(([value, v]) => ({
  value,
  label: v.label,
}));

function initialState(mod) {
  return {
    name: mod?.name || '',
    description: mod?.description || '',
    status: mod?.status || 'planned',
    progress: mod?.progress ?? 0,
    order_index: mod?.order_index ?? 0,
    start_date: mod?.start_date ? ymd(mod.start_date) : '',
    target_date: mod?.target_date ? ymd(mod.target_date) : '',
  };
}

export function ModuleFormModal({ open, onClose, module: mod }) {
  const isEdit = !!mod;
  const [form, setForm] = useState(initialState(mod));
  const [error, setError] = useState('');
  const createMut = useCreateModule();
  const updateMut = useUpdateModule();

  useEffect(() => {
    if (open) {
      setForm(initialState(mod));
      setError('');
    }
  }, [open, mod]);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    const payload = {
      name: form.name.trim(),
      description: form.description.trim() || null,
      status: form.status,
      progress: Number(form.progress) || 0,
      order_index: Number(form.order_index) || 0,
      start_date: form.start_date || null,
      target_date: form.target_date || null,
    };
    try {
      if (isEdit) await updateMut.mutateAsync({ id: mod.id, payload });
      else await createMut.mutateAsync(payload);
      onClose();
    } catch (err) {
      setError(apiErrorMessage(err, 'Gagal menyimpan modul'));
    }
  };

  const saving = createMut.isPending || updateMut.isPending;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit Modul' : 'Tambah Modul'}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} type="button">
            Batal
          </Button>
          <Button type="submit" form="module-form" loading={saving}>
            Simpan
          </Button>
        </>
      }
    >
      <form id="module-form" onSubmit={submit} className="space-y-4">
        <TextInput
          id="mod-name"
          label="Nama Modul"
          placeholder="Misal: Modul Pelanggan"
          value={form.name}
          onChange={set('name')}
          required
        />
        <TextArea id="mod-desc" label="Deskripsi" placeholder="Ruang lingkup modul…" value={form.description} onChange={set('description')} />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Select id="mod-status" label="Status" options={STATUS_OPTIONS} value={form.status} onChange={set('status')} />
          <TextInput id="mod-progress" type="number" min="0" max="100" label="Progres (%)" value={form.progress} onChange={set('progress')} />
          <TextInput id="mod-order" type="number" min="0" label="Urutan" value={form.order_index} onChange={set('order_index')} />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <TextInput id="mod-start" type="date" label="Tanggal mulai" value={form.start_date} onChange={set('start_date')} />
          <TextInput id="mod-target" type="date" label="Target selesai" value={form.target_date} onChange={set('target_date')} />
        </div>
        {error && <p className="text-sm text-red-500" role="alert">{error}</p>}
      </form>
    </Modal>
  );
}
