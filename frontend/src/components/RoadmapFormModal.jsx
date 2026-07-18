import { useEffect, useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { TextInput, TextArea, Select } from '@/components/ui/Field';
import { MODULE_STATUS } from '@/components/ui/Badge';
import { useCreateRoadmap, useUpdateRoadmap } from '@/hooks/useRoadmap';
import { apiErrorMessage } from '@/lib/api';
import { ymd } from '@/lib/format';

// Roadmap steps use the same three-stage status as modules (minus on_hold).
const STATUS_OPTIONS = ['planned', 'in_progress', 'done'].map((value) => ({
  value,
  label: MODULE_STATUS[value].label,
}));

function initialState(step, nextOrder) {
  return {
    title: step?.title || '',
    description: step?.description || '',
    status: step?.status || 'planned',
    target_date: step?.target_date ? ymd(step.target_date) : '',
    order_index: step?.order_index ?? nextOrder ?? 0,
  };
}

export function RoadmapFormModal({ open, onClose, moduleId, step, nextOrder }) {
  const isEdit = !!step;
  const [form, setForm] = useState(initialState(step, nextOrder));
  const [error, setError] = useState('');
  const createMut = useCreateRoadmap(moduleId);
  const updateMut = useUpdateRoadmap(moduleId);

  useEffect(() => {
    if (open) {
      setForm(initialState(step, nextOrder));
      setError('');
    }
  }, [open, step, nextOrder]);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    const payload = {
      title: form.title.trim(),
      description: form.description.trim() || null,
      status: form.status,
      target_date: form.target_date || null,
      order_index: Number(form.order_index) || 0,
    };
    try {
      if (isEdit) await updateMut.mutateAsync({ id: step.id, payload });
      else await createMut.mutateAsync({ ...payload, module_id: moduleId });
      onClose();
    } catch (err) {
      setError(apiErrorMessage(err, 'Gagal menyimpan roadmap step'));
    }
  };

  const saving = createMut.isPending || updateMut.isPending;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit Roadmap Step' : 'Tambah Roadmap Step'}
      footer={
        <>
          <Button variant="secondary" type="button" onClick={onClose}>Batal</Button>
          <Button type="submit" form="roadmap-form" loading={saving}>Simpan</Button>
        </>
      }
    >
      <form id="roadmap-form" onSubmit={submit} className="space-y-4">
        <TextInput
          id="rm-title"
          label="Judul Step"
          placeholder="Misal: Desain skema database"
          value={form.title}
          onChange={set('title')}
          required
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Select id="rm-status" label="Status" options={STATUS_OPTIONS} value={form.status} onChange={set('status')} />
          <TextInput id="rm-target" type="date" label="Target (opsional)" value={form.target_date} onChange={set('target_date')} />
          <TextInput id="rm-order" type="number" min="0" label="Urutan" value={form.order_index} onChange={set('order_index')} />
        </div>
        <TextArea
          id="rm-desc"
          label="Detail (opsional)"
          rows={6}
          className="min-h-[140px]"
          placeholder="Penjelasan step ini — cakupan, hasil yang diharapkan, catatan…"
          value={form.description}
          onChange={set('description')}
        />
        {error && <p className="text-sm text-red-500" role="alert">{error}</p>}
      </form>
    </Modal>
  );
}
