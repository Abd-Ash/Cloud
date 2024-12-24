import { Loader } from 'lucide-react';
import MediaCard from './MediaCard';
import type { Media } from '../../types';

interface MediaGridProps {
  media: Media[] | undefined;
  isLoading: boolean;
  emptyMessage?: string;
}

export default function MediaGrid({ media, isLoading, emptyMessage = 'No files found' }: MediaGridProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!media?.length) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {media.map((item) => (
        <MediaCard key={item.id} media={item} />
      ))}
    </div>
  );
}