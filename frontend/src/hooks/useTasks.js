import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { taskService } from '@/services/task.service';
import { authService } from '@/services/auth.service';

export function useModuleTasks(moduleId) {
  return useQuery({
    queryKey: ['tasks', 'module', moduleId],
    queryFn: () => taskService.listByModule(moduleId),
    enabled: !!moduleId,
  });
}

export function useMyTasks(userId) {
  return useQuery({
    queryKey: ['tasks', 'mine', userId],
    queryFn: () => taskService.listMine(userId),
    enabled: !!userId,
  });
}

export function useAssignees() {
  return useQuery({
    queryKey: ['assignees'],
    queryFn: authService.assignees,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: taskService.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks'] }),
  });
}

// Optimistic status/field updates so drag-and-drop feels instant.
export function useUpdateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => taskService.update(id, payload),
    onMutate: async ({ id, payload }) => {
      await qc.cancelQueries({ queryKey: ['tasks'] });
      const prev = qc.getQueriesData({ queryKey: ['tasks'] });
      qc.setQueriesData({ queryKey: ['tasks'] }, (old) =>
        Array.isArray(old) ? old.map((t) => (t.id === id ? { ...t, ...payload } : t)) : old
      );
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      ctx?.prev?.forEach(([key, data]) => qc.setQueryData(key, data));
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ['tasks'] }),
  });
}

export function useDeleteTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: taskService.remove,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks'] }),
  });
}
