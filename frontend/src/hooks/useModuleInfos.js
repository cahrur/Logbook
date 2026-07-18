import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { infoService } from '@/services/moduleInfo.service';

export function useModuleInfos(moduleId) {
  return useQuery({
    queryKey: ['infos', moduleId],
    queryFn: () => infoService.list(moduleId),
    enabled: !!moduleId,
  });
}

function invalidate(qc, moduleId) {
  qc.invalidateQueries({ queryKey: ['infos', moduleId] });
}

export function useCreateInfo(moduleId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: infoService.create,
    onSuccess: () => invalidate(qc, moduleId),
  });
}

export function useUpdateInfo(moduleId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => infoService.update(id, payload),
    onSuccess: () => invalidate(qc, moduleId),
  });
}

export function useDeleteInfo(moduleId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: infoService.remove,
    onSuccess: () => invalidate(qc, moduleId),
  });
}
