import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { Media } from '../types';

export function useMediaOverview(limit: number = 20) {
  return useQuery<Media[]>({
    queryKey: ['media', 'overview'],
    queryFn: () => api.get('/media/overview', {
      params: { limit }
    }).then(res => res.data),
  });
}