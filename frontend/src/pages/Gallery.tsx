import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { Loader } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { useNavigate } from 'react-router-dom';
import MediaCard from '../components/MediaCard';
import FolderView from '../components/FolderView';
import type { Media, Folder } from '../types';

export default function Gallery() {
  const [currentFolder, setCurrentFolder] = useState<string | undefined>();
  const { token } = useAuthStore();
  const navigate = useNavigate();

  const { data: folders, isLoading: foldersLoading } = useQuery<Folder[]>({
    queryKey: ['folders', currentFolder],
    queryFn: () => api.get('/media/folders', {
      params: { parent_id: currentFolder }
    }).then(res => res.data),
  });

  const { data: media, isLoading: mediaLoading } = useQuery<Media[]>({
    queryKey: ['media', currentFolder],
    queryFn: () => api.get('/media', {
      params: { folder_id: currentFolder }
    }).then(res => res.data),
  });

  if (!token) {
    navigate('/login');
    return null;
  }

  const isLoading = foldersLoading || mediaLoading;

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
      
      <FolderView
        folders={folders || []}
        currentFolder={currentFolder}
        onFolderClick={setCurrentFolder}
      />
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {media?.map((item) => (
          <MediaCard 
            key={item.id} 
            media={item}
            onMove={(folderId) => {
              api.put(`/media/${item.id}/move`, { folder_id: folderId });
            }}
          />
        ))}
      </div>
    </div>
  );
}