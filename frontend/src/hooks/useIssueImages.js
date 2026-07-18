import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { issueImageService } from '@/services/issueImage.service';

export function useIssueImages(issueId) {
  return useQuery({
    queryKey: ['issue-images', issueId],
    queryFn: () => issueImageService.list(issueId),
    enabled: !!issueId,
  });
}

function invalidate(qc, issueId) {
  qc.invalidateQueries({ queryKey: ['issue-images', issueId] });
}

export function useUploadIssueImage(issueId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (file) => issueImageService.upload(issueId, file),
    onSuccess: () => invalidate(qc, issueId),
  });
}

export function useDeleteIssueImage(issueId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: issueImageService.remove,
    onSuccess: () => invalidate(qc, issueId),
  });
}
