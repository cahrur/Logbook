import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { moduleService } from '@/services/module.service';

export function useModules() {
  return useQuery({ queryKey: ['modules'], queryFn: moduleService.list });
}

export function useModule(id) {
  return useQuery({
    queryKey: ['modules', id],
    queryFn: () => moduleService.getById(id),
    enabled: !!id,
  });
}

export function useCreateModule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: moduleService.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['modules'] }),
  });
}

export function useUpdateModule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => moduleService.update(id, payload),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['modules'] });
      qc.invalidateQueries({ queryKey: ['modules', vars.id] });
    },
  });
}

export function useDeleteModule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: moduleService.remove,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['modules'] }),
  });
}
