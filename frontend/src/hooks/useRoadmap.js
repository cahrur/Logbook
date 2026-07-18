import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { roadmapService } from '@/services/roadmap.service';

export function useRoadmap(moduleId) {
  return useQuery({
    queryKey: ['roadmap', moduleId],
    queryFn: () => roadmapService.list(moduleId),
    enabled: !!moduleId,
  });
}

function invalidate(qc, moduleId) {
  qc.invalidateQueries({ queryKey: ['roadmap', moduleId] });
}

export function useCreateRoadmap(moduleId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: roadmapService.create,
    onSuccess: () => invalidate(qc, moduleId),
  });
}

export function useUpdateRoadmap(moduleId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => roadmapService.update(id, payload),
    onSuccess: () => invalidate(qc, moduleId),
  });
}

export function useDeleteRoadmap(moduleId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: roadmapService.remove,
    onSuccess: () => invalidate(qc, moduleId),
  });
}
