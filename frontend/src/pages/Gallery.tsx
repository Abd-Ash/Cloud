import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { Loader } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { useNavigate } from 'react-router-dom';
// import MediaCard from '../components/MediaCard';
import MediaCard from '../components/media/MediaCard';
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
      params: { folder_id: currentFolder || undefined  }
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
            // onMove={(folderId) => {
            //   api.put(`/media/${item.id}/move`, { folder_id: folderId });
            // }}
          />
        ))}
      </div>
    </div>
  );
}
/** import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { Upload } from 'lucide-react';
import { Link } from 'react-router-dom';
import FolderView from '../components/FolderView';
import MediaGrid from '../components/media/MediaGrid';
import { useMediaOverview } from '../hooks/useMediaOverview';
import type { Media, Folder } from '../types';

export default function Gallery() {
  const [currentFolder, setCurrentFolder] = useState<string | undefined>();

  const { data: folders, isLoading: foldersLoading } = useQuery<Folder[]>({
    queryKey: ['folders', currentFolder],
    queryFn: () => api.get('/media/folders', {
      params: { parent_id: currentFolder }
    }).then(res => res.data),
  });

  // Fetch folder-specific media or overview based on current view
  const { data: folderMedia, isLoading: folderMediaLoading } = useQuery<Media[]>({
    queryKey: ['media', 'folder', currentFolder],
    queryFn: () => api.get('/media', {
      params: { folder_id: currentFolder }
    }).then(res => res.data),
    enabled: !!currentFolder,
  });

  const { data: overviewMedia, isLoading: overviewLoading } = useMediaOverview(20);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          {currentFolder ? 'Folder View' : 'My Gallery'}
        </h1>
        <Link
          to={`/upload${currentFolder ? `?folder=${currentFolder}` : ''}`}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Upload className="w-4 h-4" />
          Upload Files
        </Link>
      </div>
      
      <FolderView
        folders={folders || []}
        currentFolder={currentFolder}
        onFolderClick={setCurrentFolder}
      />
      
      <MediaGrid 
        media={currentFolder ? folderMedia : overviewMedia}
        isLoading={currentFolder ? folderMediaLoading : overviewLoading}
        emptyMessage={currentFolder ? 'No files in this folder' : 'No files uploaded yet'}
      />
    </div>
  );
} */