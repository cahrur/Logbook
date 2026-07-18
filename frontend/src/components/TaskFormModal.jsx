import { useEffect, useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { TextInput, TextArea, Select } from '@/components/ui/Field';
import { TASK_STATUS, TASK_STATUS_ORDER } from '@/components/ui/Badge';
import { useCreateTask, useUpdateTask, useAssignees } from '@/hooks/useTasks';
import { useAuth } from '@/context/AuthContext';
import { apiErrorMessage } from '@/lib/api';
import { ymd } from '@/lib/format';

const STATUS_OPTIONS = TASK_STATUS_ORDER.map((value) => ({ value, label: TASK_STATUS[value].label }));

function initialState(task, defaultAssigneeId) {
  return {
    title: task?.title || '',
    detail: task?.detail || '',
    deadline: task?.deadline ? ymd(task.deadline) : '',
    status: task?.status || 'todo',
    assignee_id: task?.assignee_id ?? defaultAssigneeId ?? '',
  };
}

export function TaskFormModal({ open, onClose, moduleId, task, defaultAssigneeId }) {
  const isEdit = !!task;
  const { user } = useAuth();
  const { data: assignees } = useAssignees();
  const [form, setForm] = useState(initialState(task, defaultAssigneeId));
  const [error, setError] = useState('');
  const createMut = useCreateTask();
  const updateMut = useUpdateTask();

  useEffect(() => {
    if (open) {
      setForm(initialState(task, defaultAssigneeId ?? user?.id));
      setError('');
    }
  }, [open, task, defaultAssigneeId, user]);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const assigneeOptions = (assignees || []).map((u) => ({
    value: String(u.id),
    label: String(u.id) === String(user?.id) ? `${u.name} (saya)` : u.name,
  }));

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    const payload = {
      title: form.title.trim(),
      detail: form.detail.trim() || null,
      deadline: form.deadline || null,
      status: form.status,
      assignee_id: form.assignee_id ? Number(form.assignee_id) : null,
    };
    try {
      if (isEdit) await updateMut.mutateAsync({ id: task.id, payload });
      else await createMut.mutateAsync({ ...payload, module_id: moduleId });
      onClose();
    } catch (err) {
      setError(apiErrorMessage(err, 'Gagal menyimpan tugas'));
    }
  };

  const saving = createMut.isPending || updateMut.isPending;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit Tugas' : 'Buat Tugas'}
      footer={
        <>
          <Button variant="secondary" type="button" onClick={onClose}>Batal</Button>
          <Button type="submit" form="task-form" loading={saving}>Simpan</Button>
        </>
      }
    >
      <form id="task-form" onSubmit={submit} className="space-y-4">
        <TextInput id="task-title" label="Judul" placeholder="Misal: Bikin wireframe halaman login" value={form.title} onChange={set('title')} required />
        <TextArea id="task-detail" label="Detail" rows={4} placeholder="Deskripsi tugas…" value={form.detail} onChange={set('detail')} />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Select
            id="task-assignee"
            label="Ditugaskan ke"
            placeholder="— Belum ditugaskan —"
            options={assigneeOptions}
            value={form.assignee_id ? String(form.assignee_id) : ''}
            onChange={set('assignee_id')}
          />
          <TextInput id="task-deadline" type="date" label="Deadline" value={form.deadline} onChange={set('deadline')} />
          <Select id="task-status" label="Status" options={STATUS_OPTIONS} value={form.status} onChange={set('status')} />
        </div>
        {error && <p className="text-sm text-red-500" role="alert">{error}</p>}
      </form>
    </Modal>
  );
}
