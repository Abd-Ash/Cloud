import { useState } from 'react';
import { Folder, Plus } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { Folder as FolderType } from '../types';

interface FolderViewProps {
  folders: FolderType[];
  currentFolder?: string;
  onFolderClick: (folderId?: string) => void;
}

export default function FolderView({ folders, currentFolder, onFolderClick }: FolderViewProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const queryClient = useQueryClient();

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

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Folders</h2>
        <button
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
        >
          <Plus className="w-4 h-4" />
          New Folder
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {currentFolder && (
          <button
            onClick={() => onFolderClick(undefined)}
            className="flex items-center gap-2 p-3 rounded-lg border border-gray-200 hover:bg-gray-50"
          >
            <Folder className="w-5 h-5 text-gray-400" />
            <span className="text-sm">Back</span>
          </button>
        )}

        {folders.map((folder) => (
          <button
            key={folder.id}
            onClick={() => onFolderClick(folder.id)}
            className={`
              flex items-center gap-2 p-3 rounded-lg border
              ${folder.id === currentFolder 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-200 hover:bg-gray-50'
              }
            `}
          >
            <Folder className="w-5 h-5 text-gray-400" />
            <span className="text-sm truncate">{folder.name}</span>
          </button>
        ))}

        {isCreating && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              createFolder.mutate(newFolderName);
            }}
            className="flex items-center gap-2 p-3 rounded-lg border border-gray-200"
          >
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
    </div>
  );
}