import { useEffect, useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { TextInput, TextArea, Select } from '@/components/ui/Field';
import { ACTIVITY_CATEGORY, DIRECTIVE_TYPE } from '@/components/ui/Badge';
import { useCreateActivity, useUpdateActivity } from '@/hooks/useActivities';
import { useModules } from '@/hooks/useModules';
import { apiErrorMessage } from '@/lib/api';
import { ymd, todayISO } from '@/lib/format';

const CATEGORY_OPTIONS = Object.entries(ACTIVITY_CATEGORY).map(([value, v]) => ({
  value,
  label: v.label,
}));

const DIRECTIVE_OPTIONS = Object.entries(DIRECTIVE_TYPE).map(([value, v]) => ({
  value,
  label: v.label,
}));

function initialState(activity, defaultModuleId) {
  return {
    activity_date: activity ? ymd(activity.activity_date) : todayISO(),
    title: activity?.title || '',
    description: activity?.description || '',
    category: activity?.category || 'development',
    module_id: activity?.module_id ?? defaultModuleId ?? '',
    duration_minutes: activity?.duration_minutes ?? '',
    directive_type: activity?.directive_type || '',
    directive_from: activity?.directive_from || '',
    due_date: activity?.due_date ? ymd(activity.due_date) : '',
  };
}

export function ActivityFormModal({ open, onClose, activity, defaultModuleId }) {
  const isEdit = !!activity;
  const [form, setForm] = useState(initialState(activity, defaultModuleId));
  const [error, setError] = useState('');
  const { data: modules } = useModules();
  const createMut = useCreateActivity();
  const updateMut = useUpdateActivity();

  useEffect(() => {
    if (open) {
      setForm(initialState(activity, defaultModuleId));
      setError('');
    }
  }, [open, activity, defaultModuleId]);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const moduleOptions = (modules || []).map((m) => ({ value: String(m.id), label: m.name }));

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    const payload = {
      activity_date: form.activity_date,
      title: form.title.trim(),
      description: form.description.trim() || null,
      category: form.category,
      module_id: form.module_id ? Number(form.module_id) : null,
      duration_minutes: form.duration_minutes ? Number(form.duration_minutes) : null,
      directive_type: form.directive_type || null,
      directive_from: form.directive_from.trim() || null,
      due_date: form.due_date || null,
    };
    try {
      if (isEdit) await updateMut.mutateAsync({ id: activity.id, payload });
      else await createMut.mutateAsync(payload);
      onClose();
    } catch (err) {
      setError(apiErrorMessage(err, 'Gagal menyimpan aktivitas'));
    }
  };

  const saving = createMut.isPending || updateMut.isPending;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit Aktivitas' : 'Catat Aktivitas'}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} type="button">
            Batal
          </Button>
          <Button type="submit" form="activity-form" loading={saving}>
            Simpan
          </Button>
        </>
      }
    >
      <form id="activity-form" onSubmit={submit} className="space-y-4">
        <TextInput
          id="act-title"
          label="Apa yang dikerjakan?"
          placeholder="Misal: Refactor skema pelanggan"
          value={form.title}
          onChange={set('title')}
          required
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <TextInput id="act-date" type="date" label="Tanggal" value={form.activity_date} onChange={set('activity_date')} required />
          <Select id="act-category" label="Kategori" options={CATEGORY_OPTIONS} value={form.category} onChange={set('category')} />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Select
            id="act-module"
            label="Modul"
            placeholder="— Tanpa modul —"
            options={moduleOptions}
            value={form.module_id ? String(form.module_id) : ''}
            onChange={set('module_id')}
          />
          <TextInput
            id="act-duration"
            type="number"
            min="0"
            label="Durasi (menit)"
            placeholder="opsional"
            value={form.duration_minutes}
            onChange={set('duration_minutes')}
          />
        </div>
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-line dark:bg-primary/40">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
            Jadikan tugas (opsional)
          </p>
          <TextInput
            id="act-due"
            type="date"
            label="Target / Deadline"
            hint="Isi kalau ini tugas bertenggat — nanti bisa ditandai selesai & dihitung keterlambatannya"
            value={form.due_date}
            onChange={set('due_date')}
          />
        </div>

        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-line dark:bg-primary/40">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
            Sumber arahan / keputusan (opsional)
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Select
              id="act-directive-type"
              label="Jenis"
              placeholder="— Tidak ada —"
              options={DIRECTIVE_OPTIONS}
              value={form.directive_type}
              onChange={set('directive_type')}
            />
            <TextInput
              id="act-directive-from"
              label="Dari siapa"
              placeholder="Misal: Pak Andi (finance)"
              value={form.directive_from}
              onChange={set('directive_from')}
            />
          </div>
        </div>

        <TextArea
          id="act-desc"
          label="Detail (opsional)"
          rows={7}
          className="min-h-[160px]"
          placeholder="Catatan lengkap — mis. hasil meeting, poin diskusi, keputusan yang diambil…"
          value={form.description}
          onChange={set('description')}
        />
        {error && <p className="text-sm text-red-500" role="alert">{error}</p>}
      </form>
    </Modal>
  );
}
