import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { activityService, dashboardService } from '@/services/activity.service';

export function useActivities(filters = {}) {
  return useQuery({
    queryKey: ['activities', filters],
    queryFn: () => activityService.list(filters),
  });
}

export function useDashboard() {
  return useQuery({ queryKey: ['dashboard'], queryFn: dashboardService.overview });
}

function invalidateActivityViews(qc) {
  qc.invalidateQueries({ queryKey: ['activities'] });
  qc.invalidateQueries({ queryKey: ['dashboard'] });
  qc.invalidateQueries({ queryKey: ['modules'] });
}

export function useCreateActivity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: activityService.create,
    onSuccess: () => invalidateActivityViews(qc),
  });
}

export function useUpdateActivity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => activityService.update(id, payload),
    onSuccess: () => invalidateActivityViews(qc),
  });
}

export function useDeleteActivity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: activityService.remove,
    onSuccess: () => invalidateActivityViews(qc),
  });
}
