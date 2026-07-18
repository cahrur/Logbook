import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { issueService } from '@/services/issue.service';

export function useModuleIssues(moduleId) {
  return useQuery({
    queryKey: ['issues', moduleId],
    queryFn: () => issueService.listByModule(moduleId),
    enabled: !!moduleId,
  });
}

export function useCreateIssue(moduleId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: issueService.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['issues', moduleId] }),
  });
}

// Optimistic so inline status/priority changes feel instant.
export function useUpdateIssue(moduleId) {
  const qc = useQueryClient();
  const key = ['issues', moduleId];
  return useMutation({
    mutationFn: ({ id, payload }) => issueService.update(id, payload),
    onMutate: async ({ id, payload }) => {
      await qc.cancelQueries({ queryKey: key });
      const prev = qc.getQueryData(key);
      qc.setQueryData(key, (old) =>
        Array.isArray(old) ? old.map((i) => (i.id === id ? { ...i, ...payload } : i)) : old
      );
      return { prev };
    },
    onError: (_e, _v, ctx) => ctx?.prev && qc.setQueryData(key, ctx.prev),
    onSettled: () => qc.invalidateQueries({ queryKey: key }),
  });
}

export function useDeleteIssue(moduleId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: issueService.remove,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['issues', moduleId] }),
  });
}
