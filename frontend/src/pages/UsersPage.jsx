import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useUsers, useCreateUser } from '@/hooks/useUsers';
import { PageHeader, CenteredSpinner, ErrorState } from '@/components/ui/Misc';
import { Card } from '@/components/ui/Card';
import { Badge, ROLE_BADGE } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { TextInput, Select } from '@/components/ui/Field';
import { useAuth } from '@/context/AuthContext';
import { apiErrorMessage } from '@/lib/api';
import { formatDate } from '@/lib/format';

const ROLE_OPTIONS = [
  { value: 'member', label: 'Member — isi & kelola (tanpa hapus)' },
  { value: 'viewer', label: 'Viewer — hanya lihat (atasan/klien)' },
  { value: 'admin', label: 'Admin — kelola semua (tanpa hapus)' },
];
const SUPERADMIN_OPTION = { value: 'superadmin', label: 'Superadmin — akses penuh + bisa hapus' };

const emptyForm = { name: '', email: '', password: '', role: 'member' };

export default function UsersPage() {
  const { isSuperAdmin } = useAuth();
  const { data: users, isLoading, isError, error } = useUsers();
  const createMut = useCreateUser();
  const roleOptions = isSuperAdmin ? [...ROLE_OPTIONS, SUPERADMIN_OPTION] : ROLE_OPTIONS;
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const openModal = () => {
    setForm(emptyForm);
    setFormError('');
    setFieldErrors({});
    setOpen(true);
  };

  const submit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFieldErrors({});
    try {
      await createMut.mutateAsync({ ...form, name: form.name.trim(), email: form.email.trim() });
      setOpen(false);
    } catch (err) {
      const errors = err?.response?.data?.errors;
      if (errors) setFieldErrors(errors);
      setFormError(apiErrorMessage(err, 'Gagal membuat user'));
    }
  };

  if (isLoading) return <CenteredSpinner />;
  if (isError) return <ErrorState message={apiErrorMessage(error)} />;

  return (
    <>
      <PageHeader
        title="Tim"
        subtitle="Kelola anggota dan hak aksesnya"
        actions={<Button icon={Plus} onClick={openModal}>Tambah User</Button>}
      />

      <Card className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-400 dark:border-line">
              <th className="px-4 py-3 font-semibold">Nama</th>
              <th className="px-4 py-3 font-semibold">Email</th>
              <th className="px-4 py-3 font-semibold">Peran</th>
              <th className="px-4 py-3 font-semibold">Bergabung</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => {
              const role = ROLE_BADGE[u.role] || ROLE_BADGE.member;
              return (
                <tr
                  key={u.id}
                  className="border-b border-slate-100 transition-colors last:border-0 hover:bg-slate-50 dark:border-line/50 dark:hover:bg-app-fill"
                >
                  <td className="px-4 py-3 font-medium text-slate-800 dark:text-app-text">{u.name}</td>
                  <td className="px-4 py-3 text-slate-500 dark:text-app-muted">{u.email}</td>
                  <td className="px-4 py-3"><Badge tone={role.tone}>{role.label}</Badge></td>
                  <td className="px-4 py-3 text-slate-400">{formatDate(u.created_at)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Tambah User"
        footer={
          <>
            <Button variant="secondary" type="button" onClick={() => setOpen(false)}>Batal</Button>
            <Button type="submit" form="user-form" loading={createMut.isPending}>Simpan</Button>
          </>
        }
      >
        <form id="user-form" onSubmit={submit} className="space-y-4">
          <TextInput id="u-name" label="Nama" value={form.name} onChange={set('name')} error={fieldErrors.name?.[0]} required />
          <TextInput id="u-email" type="email" label="Email" value={form.email} onChange={set('email')} error={fieldErrors.email?.[0]} required />
          <TextInput
            id="u-pass"
            type="password"
            label="Password"
            value={form.password}
            onChange={set('password')}
            error={fieldErrors.password?.[0]}
            hint="Min 8 karakter, ada huruf besar, kecil, dan angka"
            required
          />
          <Select id="u-role" label="Peran" options={roleOptions} value={form.role} onChange={set('role')} />
          {formError && !Object.keys(fieldErrors).length && (
            <p className="text-sm text-red-500" role="alert">{formError}</p>
          )}
        </form>
      </Modal>
    </>
  );
}
