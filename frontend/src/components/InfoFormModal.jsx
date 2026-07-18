import { useEffect, useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { TextInput, TextArea } from '@/components/ui/Field';
import { useCreateInfo, useUpdateInfo } from '@/hooks/useModuleInfos';
import { apiErrorMessage } from '@/lib/api';

// Prepend https:// when the user omits the scheme.
function normalizeLink(value) {
  const s = value.trim();
  if (!s) return s;
  return /^https?:\/\//i.test(s) ? s : `https://${s}`;
}

function initialState(info) {
  return {
    title: info?.title || '',
    description: info?.description || '',
    link: info?.link || '',
  };
}

export function InfoFormModal({ open, onClose, moduleId, info }) {
  const isEdit = !!info;
  const [form, setForm] = useState(initialState(info));
  const [error, setError] = useState('');
  const createMut = useCreateInfo(moduleId);
  const updateMut = useUpdateInfo(moduleId);

  useEffect(() => {
    if (open) {
      setForm(initialState(info));
      setError('');
    }
  }, [open, info]);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    const payload = {
      title: form.title.trim(),
      description: form.description.trim() || null,
      link: normalizeLink(form.link),
    };
    try {
      if (isEdit) await updateMut.mutateAsync({ id: info.id, payload });
      else await createMut.mutateAsync({ ...payload, module_id: moduleId });
      onClose();
    } catch (err) {
      setError(apiErrorMessage(err, 'Gagal menyimpan informasi'));
    }
  };

  const saving = createMut.isPending || updateMut.isPending;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit Informasi' : 'Tambah Informasi'}
      footer={
        <>
          <Button variant="secondary" type="button" onClick={onClose}>Batal</Button>
          <Button type="submit" form="info-form" loading={saving}>Simpan</Button>
        </>
      }
    >
      <form id="info-form" onSubmit={submit} className="space-y-4">
        <TextInput id="info-title" label="Judul" placeholder="Misal: Dokumen Spesifikasi API" value={form.title} onChange={set('title')} required />
        <TextArea id="info-desc" label="Keterangan (opsional)" rows={3} placeholder="Penjelasan singkat…" value={form.description} onChange={set('description')} />
        <TextInput id="info-link" label="Link" type="url" placeholder="https://…" value={form.link} onChange={set('link')} required />
        {error && <p className="text-sm text-red-500" role="alert">{error}</p>}
      </form>
    </Modal>
  );
}
