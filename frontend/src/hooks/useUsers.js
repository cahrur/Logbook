import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authService } from '@/services/auth.service';

export function useUsers() {
  return useQuery({ queryKey: ['users'], queryFn: authService.listUsers });
}

export function useCreateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: authService.createUser,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
  });
}
