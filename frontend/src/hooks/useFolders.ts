import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { Folder } from '../types';

export function useFolders() {
  const queryClient = useQueryClient();

  const { data: folders = [] } = useQuery<Folder[]>({
    queryKey: ['folders'],
    queryFn: () => api.get('/media/folders').then(res => res.data),
  });

  const createFolder = useMutation({
    mutationFn: (name: string) => 
      api.post('/media/folders', { name }).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['folders'] });
    },
  });

  return {
    folders,
    createFolder: (name: string) => createFolder.mutate(name),
  };
}