import { useEffect, useRef, useState } from 'react';
import { ImagePlus, X } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { TextInput, TextArea, Select } from '@/components/ui/Field';
import {
  ISSUE_PRIORITY,
  ISSUE_PRIORITY_ORDER,
  ISSUE_STATUS,
  ISSUE_STATUS_ORDER,
} from '@/components/ui/Badge';
import { useCreateIssue, useUpdateIssue } from '@/hooks/useIssues';
import { useAssignees } from '@/hooks/useTasks';
import { useAuth } from '@/context/AuthContext';
import { issueImageService } from '@/services/issueImage.service';
import { apiErrorMessage } from '@/lib/api';
import { ymd, formatBytes } from '@/lib/format';

const PRIORITY_OPTIONS = ISSUE_PRIORITY_ORDER.map((v) => ({ value: v, label: ISSUE_PRIORITY[v].label }));
const STATUS_OPTIONS = ISSUE_STATUS_ORDER.map((v) => ({ value: v, label: ISSUE_STATUS[v].label }));
const MAX_BYTES = 2 * 1024 * 1024;

function initialState(issue) {
  return {
    title: issue?.title || '',
    description: issue?.description || '',
    priority: issue?.priority || 'medium',
    status: issue?.status || 'open',
    deadline: issue?.deadline ? ymd(issue.deadline) : '',
    assignee_id: issue?.assignee_id ?? '',
  };
}

export function IssueFormModal({ open, onClose, moduleId, issue }) {
  const isEdit = !!issue;
  const qc = useQueryClient();
  const { user } = useAuth();
  const { data: assignees } = useAssignees();
  const [form, setForm] = useState(initialState(issue));
  const [pending, setPending] = useState([]); // images to upload after save
  const [error, setError] = useState('');
  const inputRef = useRef(null);
  const createMut = useCreateIssue(moduleId);
  const updateMut = useUpdateIssue(moduleId);

  useEffect(() => {
    if (open) {
      setForm(initialState(issue));
      setPending([]);
      setError('');
    }
  }, [open, issue]);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const addImages = (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = '';
    setError('');
    const valid = [];
    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        setError('Hanya gambar yang diperbolehkan.');
        continue;
      }
      if (file.size > MAX_BYTES) {
        setError(`"${file.name}" melebihi 2MB.`);
        continue;
      }
      valid.push(file);
    }
    if (valid.length) setPending((p) => [...p, ...valid]);
  };

  const removePending = (idx) => setPending((p) => p.filter((_, i) => i !== idx));

  const assigneeOptions = (assignees || []).map((u) => ({
    value: String(u.id),
    label: String(u.id) === String(user?.id) ? `${u.name} (saya)` : u.name,
  }));

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    const payload = {
      title: form.title.trim(),
      description: form.description.trim() || null,
      priority: form.priority,
      status: form.status,
      deadline: form.deadline || null,
      assignee_id: form.assignee_id ? Number(form.assignee_id) : null,
    };
    try {
      const saved = isEdit
        ? await updateMut.mutateAsync({ id: issue.id, payload })
        : await createMut.mutateAsync({ ...payload, module_id: moduleId });

      // Upload attached images to the saved issue.
      const issueId = saved?.id || issue?.id;
      if (issueId && pending.length) {
        const results = await Promise.allSettled(pending.map((f) => issueImageService.upload(issueId, f)));
        qc.invalidateQueries({ queryKey: ['issue-images', issueId] });
        if (results.some((r) => r.status === 'rejected')) {
          window.alert('Issue tersimpan, tapi sebagian gambar gagal diunggah.');
        }
      }
      onClose();
    } catch (err) {
      setError(apiErrorMessage(err, 'Gagal menyimpan issue'));
    }
  };

  const saving = createMut.isPending || updateMut.isPending;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit Issue' : 'Tambah Issue'}
      footer={
        <>
          <Button variant="secondary" type="button" onClick={onClose}>Batal</Button>
          <Button type="submit" form="issue-form" loading={saving}>Simpan</Button>
        </>
      }
    >
      <form id="issue-form" onSubmit={submit} className="space-y-4">
        <TextInput id="issue-title" label="Judul Issue" placeholder="Misal: Tombol simpan error di halaman X" value={form.title} onChange={set('title')} required />
        <TextArea id="issue-desc" label="Deskripsi" rows={4} placeholder="Langkah reproduksi, ekspektasi vs aktual…" value={form.description} onChange={set('description')} />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Select id="issue-priority" label="Prioritas" options={PRIORITY_OPTIONS} value={form.priority} onChange={set('priority')} />
          <Select id="issue-status" label="Status" options={STATUS_OPTIONS} value={form.status} onChange={set('status')} />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <TextInput id="issue-deadline" type="date" label="Deadline" value={form.deadline} onChange={set('deadline')} />
          <Select
            id="issue-assignee"
            label="Ditugaskan ke"
            placeholder="Pilih anggota tim..."
            options={assigneeOptions}
            value={form.assignee_id ? String(form.assignee_id) : ''}
            onChange={set('assignee_id')}
          />
        </div>

        {/* Image attachments */}
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Gambar (opsional, maks 2MB)</label>
            <input ref={inputRef} type="file" accept="image/*" multiple className="hidden" onChange={addImages} />
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-600 hover:border-brand-300 hover:text-brand-600 dark:border-line dark:text-slate-300"
            >
              <ImagePlus className="h-3.5 w-3.5" /> Tambah gambar
            </button>
          </div>
          {pending.length > 0 && (
            <div className="space-y-1.5">
              {pending.map((f, i) => (
                <div key={i} className="flex items-center justify-between gap-2 rounded-md border border-slate-200 px-2.5 py-1.5 text-xs dark:border-line">
                  <span className="truncate text-slate-600 dark:text-slate-300">{f.name}</span>
                  <span className="flex shrink-0 items-center gap-2 text-slate-400">
                    {formatBytes(f.size)}
                    <button type="button" onClick={() => removePending(i)} aria-label="Hapus" className="hover:text-red-500">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </span>
                </div>
              ))}
            </div>
          )}
          {isEdit && (
            <p className="mt-1 text-[0.7rem] text-slate-400">Gambar yang sudah ada dikelola dari halaman detail issue.</p>
          )}
        </div>

        {error && <p className="text-sm text-red-500" role="alert">{error}</p>}
      </form>
    </Modal>
  );
}
