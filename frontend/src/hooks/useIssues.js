import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { issueService } from '@/services/issue.service';

export function useModuleIssues(moduleId) {
  return useQuery({
    queryKey: ['issues', 'module', moduleId],
    queryFn: () => issueService.listByModule(moduleId),
    enabled: !!moduleId,
  });
}

export function useMyIssues(userId) {
  return useQuery({
    queryKey: ['issues', 'mine', userId],
    queryFn: () => issueService.listMine(userId),
    enabled: !!userId,
  });
}

export function useCreateIssue() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: issueService.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['issues'] }),
  });
}

// Optimistic so inline status/priority changes and drag-and-drop feel instant.
// Every ['issues', ...] query is patched, so the module list and "Issue Saya"
// stay in sync no matter which one triggered the change.
export function useUpdateIssue() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => issueService.update(id, payload),
    onMutate: async ({ id, payload }) => {
      await qc.cancelQueries({ queryKey: ['issues'] });
      const prev = qc.getQueriesData({ queryKey: ['issues'] });
      qc.setQueriesData({ queryKey: ['issues'] }, (old) =>
        Array.isArray(old) ? old.map((i) => (i.id === id ? { ...i, ...payload } : i)) : old
      );
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      ctx?.prev?.forEach(([key, data]) => qc.setQueryData(key, data));
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ['issues'] }),
  });
}

export function useDeleteIssue() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: issueService.remove,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['issues'] }),
  });
}
