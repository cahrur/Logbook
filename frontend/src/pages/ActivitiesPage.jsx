import { useState, useMemo, useEffect } from 'react';
import { Plus, Search, X } from 'lucide-react';
import { useActivities, useDeleteActivity } from '@/hooks/useActivities';
import { useModules } from '@/hooks/useModules';
import { useAuth } from '@/context/AuthContext';
import { PageHeader, CenteredSpinner, ErrorState, EmptyState } from '@/components/ui/Misc';
import { Select } from '@/components/ui/Field';
import { Button } from '@/components/ui/Button';
import { ACTIVITY_CATEGORY } from '@/components/ui/Badge';
import { ActivityItem } from '@/components/ActivityItem';
import { ActivityFormModal } from '@/components/ActivityFormModal';
import { ActivityDetailModal } from '@/components/ActivityDetailModal';
import { apiErrorMessage } from '@/lib/api';
import { formatDate, ymd } from '@/lib/format';

const CATEGORY_OPTIONS = Object.entries(ACTIVITY_CATEGORY).map(([value, v]) => ({ value, label: v.label }));

const TASK_OPTIONS = [
  { value: 'task', label: 'Semua tugas (ada deadline)' },
  { value: 'todo', label: 'Tugas belum selesai' },
  { value: 'done', label: 'Tugas selesai' },
];

// Group activities by their date for a timeline view.
function groupByDate(activities) {
  const groups = new Map();
  for (const a of activities) {
    const key = ymd(a.activity_date);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(a);
  }
  return [...groups.entries()];
}

export default function ActivitiesPage() {
  const { canWrite, canDelete } = useAuth();
  const { data: modules } = useModules();
  const [filters, setFilters] = useState({ module_id: '', category: '', task: '' });
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [viewing, setViewing] = useState(null);

  // Debounce search input so we don't hit the API on every keystroke.
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const queryFilters = useMemo(
    () => ({
      module_id: filters.module_id ? Number(filters.module_id) : undefined,
      category: filters.category || undefined,
      search: debouncedSearch || undefined,
      is_task: filters.task === 'task' ? 'true' : undefined,
      task_status: filters.task === 'todo' || filters.task === 'done' ? filters.task : undefined,
    }),
    [filters, debouncedSearch]
  );

  const { data: activities, isLoading, isError, error } = useActivities(queryFilters);
  const deleteMut = useDeleteActivity();

  const moduleOptions = (modules || []).map((m) => ({ value: String(m.id), label: m.name }));

  const openCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };
  const openEdit = (a) => {
    setEditing(a);
    setModalOpen(true);
  };
  const handleDelete = async (a) => {
    if (!window.confirm('Hapus aktivitas ini?')) return;
    try {
      await deleteMut.mutateAsync(a.id);
    } catch (err) {
      window.alert(apiErrorMessage(err, 'Gagal menghapus'));
    }
  };

  const grouped = activities ? groupByDate(activities) : [];

  return (
    <>
      <PageHeader
        title="Aktivitas"
        subtitle="Timeline kerja harian tim"
        actions={canWrite && <Button icon={Plus} onClick={openCreate}>Catat Aktivitas</Button>}
      />

      {/* Search — matches title and detail */}
      <div className="mb-3 max-w-xl">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari judul atau isi aktivitas…"
            aria-label="Cari aktivitas"
            className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-9 text-sm text-slate-800 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-line dark:bg-primary dark:text-slate-100"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-0.5 text-slate-400 hover:text-slate-600"
              aria-label="Hapus pencarian"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Select
          placeholder="Semua modul"
          options={moduleOptions}
          value={filters.module_id}
          onChange={(e) => setFilters((f) => ({ ...f, module_id: e.target.value }))}
        />
        <Select
          placeholder="Semua kategori"
          options={CATEGORY_OPTIONS}
          value={filters.category}
          onChange={(e) => setFilters((f) => ({ ...f, category: e.target.value }))}
        />
        <Select
          placeholder="Semua aktivitas"
          options={TASK_OPTIONS}
          value={filters.task}
          onChange={(e) => setFilters((f) => ({ ...f, task: e.target.value }))}
        />
      </div>

      {isLoading ? (
        <CenteredSpinner />
      ) : isError ? (
        <ErrorState message={apiErrorMessage(error)} />
      ) : activities.length === 0 ? (
        <EmptyState
          title={debouncedSearch ? `Tidak ada hasil untuk "${debouncedSearch}"` : 'Belum ada aktivitas'}
          description={debouncedSearch ? 'Coba kata kunci lain atau ubah filter.' : 'Sesuaikan filter atau catat aktivitas baru.'}
          action={!debouncedSearch && canWrite && <Button icon={Plus} onClick={openCreate}>Catat Aktivitas</Button>}
        />
      ) : (
        <div className="space-y-6">
          {grouped.map(([date, items]) => (
            <div key={date}>
              <h3 className="mb-2 text-sm font-semibold text-slate-500 dark:text-slate-400">{formatDate(date)}</h3>
              <div className="space-y-2.5">
                {items.map((a) => (
                  <ActivityItem
                    key={a.id}
                    activity={a}
                    onView={setViewing}
                    onEdit={canWrite ? openEdit : undefined}
                    onDelete={canDelete ? handleDelete : undefined}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <ActivityDetailModal
        open={!!viewing}
        onClose={() => setViewing(null)}
        activity={viewing}
        canWrite={canWrite}
        onEdit={(a) => {
          setViewing(null);
          openEdit(a);
        }}
      />
      <ActivityFormModal open={modalOpen} onClose={() => setModalOpen(false)} activity={editing} />
    </>
  );
}
