import { useState } from 'react';
import { Folder, Plus, Trash2 } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import DeleteConfirmModal from './common/DeleteConfirmModal';
import type { Folder as FolderType } from '../types';
// import { useNavigate, useSearchParams } from 'react-router-dom';

interface FolderViewProps {
  folders: FolderType[];
  currentFolder?: string;
  onFolderClick: (folderId?: string) => void;
}

export default function FolderView({ folders, currentFolder, onFolderClick }: FolderViewProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [folderToDelete, setFolderToDelete] = useState<string | null>(null);
  const queryClient = useQueryClient();
  // const navigate = useNavigate();
  // const [searchParams, setSearchParams] = useSearchParams();

  const createFolder = useMutation({
    mutationFn: (name: string) => 
      api.post('/media/folders', { 
        name,
        parent_folder_id: currentFolder 
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['folders'] });
      setIsCreating(false);
      setNewFolderName('');
    },
  });

  const deleteFolder = useMutation({
    mutationFn: (id: string) => api.delete(`/media/folders/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['folders'] });
      queryClient.invalidateQueries({ queryKey: ['media'] });
      if (currentFolder === folderToDelete) {
        onFolderClick(undefined);
        // navigate('/');
      }
    },
  });
  
  // const updateFolderInUrl = (folderId?: string) => {
  //   const currentFolder = searchParams.get('folder');

  //   if (folderId && folderId !== currentFolder) {
  //     searchParams.set('folder', folderId);
  //     onFolderClick(folderId)
  //     setSearchParams(searchParams);
  //   } else if (!folderId && currentFolder) {
  //     searchParams.delete('folder');
  //     setSearchParams(searchParams);
  //     onFolderClick(undefined);
  //   }
  // };

  return (
    <div className="mb-6 bg-white rounded-lg p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Folders</h2>
        <button
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Folder
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {currentFolder && (
          <button
            onClick={() => onFolderClick(undefined)}
            className="flex items-center gap-2 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <Folder className="w-5 h-5 text-gray-400" />
            <span className="text-sm">Back</span>
          </button>
        )}

        {folders.map((folder) => (
          <div
            key={folder.id}
            className={`
              relative group
              flex items-center gap-2 p-3 rounded-lg border
              ${folder.id === currentFolder 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-200 hover:bg-gray-50'
              }
            `}
          >
            <button
              onClick={() => onFolderClick(folder.id)}
              className="flex items-center gap-2 flex-1 min-w-0"
            >
              <Folder className="w-5 h-5 text-gray-400 flex-shrink-0" />
              <span className="text-sm truncate">{folder.name}</span>
            </button>
            
            <button
              onClick={() => setFolderToDelete(folder.id)}
              className="absolute top-2 right-2 p-1 rounded bg-white shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Trash2 className="w-4 h-4 text-red-500" />
            </button>
          </div>
        ))}

        {isCreating && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (newFolderName.trim()) {
                createFolder.mutate(newFolderName);
              }
            }}
            className="flex items-center gap-2 p-3 rounded-lg border border-gray-200"
          >
            <Folder className="w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="Folder name"
              className="text-sm border-none focus:ring-0 p-0 w-full"
              autoFocus
            />
          </form>
        )}
      </div>

      <DeleteConfirmModal
        isOpen={!!folderToDelete}
        onClose={() => setFolderToDelete(null)}
        onConfirm={() => folderToDelete && deleteFolder.mutate(folderToDelete)}
        title="Delete Folder"
        message="Are you sure you want to delete this folder? All files inside will be deleted permanently."
      />
    </div>
  );
}