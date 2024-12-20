import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { Grid, Loader } from 'lucide-react';

export default function Gallery() {
  const { data: media, isLoading } = useQuery({
    queryKey: ['media'],
    queryFn: () => api.get('/media').then(res => res.data)
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">My Gallery</h1>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {media?.map((item: any) => (
          <div key={item.id} className="relative group">
            <img
              src={`${import.meta.env.VITE_API_URL}/media/${item.id}`}
              alt={item.filename}
              className="w-full h-48 object-cover rounded-lg"
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300 rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
}