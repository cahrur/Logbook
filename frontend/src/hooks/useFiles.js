import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fileService } from '@/services/file.service';

export function useFiles(moduleId) {
  return useQuery({
    queryKey: ['files', moduleId],
    queryFn: () => fileService.list(moduleId),
    enabled: !!moduleId,
  });
}

function invalidate(qc, moduleId) {
  qc.invalidateQueries({ queryKey: ['files', moduleId] });
}

export function useUploadFile(moduleId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (file) => fileService.upload(moduleId, file),
    onSuccess: () => invalidate(qc, moduleId),
  });
}

export function useDeleteFile(moduleId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fileService.remove,
    onSuccess: () => invalidate(qc, moduleId),
  });
}
