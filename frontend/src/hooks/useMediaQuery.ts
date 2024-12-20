import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { Media } from '../types';

export function useMediaQuery() {
  return useQuery<Media[]>({
    queryKey: ['media'],
    queryFn: () => api.get('/media').then(res => res.data),
  });
}