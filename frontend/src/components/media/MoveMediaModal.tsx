import { useState } from 'react';
import { Dialog } from '../common/Dialog';
import { Media } from '../../types';
import { useFolders } from '../../hooks/useFolders';
import { FolderPlus, Folder as FolderIcon } from 'lucide-react';

interface MoveMediaModalProps {
  media: Media;
  isOpen: boolean;
  onClose: () => void;
  onMove: (folderId: string | null) => void;
}

export default function MoveMediaModal({ isOpen, onClose, onMove }: MoveMediaModalProps) {
  const [newFolderName, setNewFolderName] = useState('');
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const { folders, createFolder } = useFolders();

  const handleCreateFolder = async () => {
    if (!newFolderName) return;
    await createFolder(newFolderName);
    setNewFolderName('');
    setIsCreatingFolder(false);
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Move File">
      <div className="p-4">
        <div className="mb-4">
          <button
            onClick={() => onMove(null)}
            className="w-full text-left px-4 py-2 rounded-lg hover:bg-gray-100 flex items-center gap-2"
          >
            <FolderIcon className="w-5 h-5 text-gray-400" />
            Root Folder
          </button>
          
          {folders.map((folder) => (
            <button
              key={folder.id}
              onClick={() => onMove(folder.id)}
              className="w-full text-left px-4 py-2 rounded-lg hover:bg-gray-100 flex items-center gap-2"
            >
              <FolderIcon className="w-5 h-5 text-gray-400" />
              {folder.name}
            </button>
          ))}
        </div>

        {isCreatingFolder ? (
          <div className="flex gap-2">
            <input
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="New folder name"
              className="flex-1 px-3 py-2 border rounded-lg"
              autoFocus
            />
            <button
              onClick={handleCreateFolder}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg"
            >
              Create
            </button>
          </div>
        ) : (
          <button
            onClick={() => setIsCreatingFolder(true)}
            className="w-full px-4 py-2 text-blue-600 rounded-lg hover:bg-blue-50 flex items-center gap-2"
          >
            <FolderPlus className="w-5 h-5" />
            New Folder
          </button>
        )}
      </div>
    </Dialog>
  );
}