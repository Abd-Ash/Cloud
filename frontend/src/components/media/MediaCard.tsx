import { useState } from 'react';
import { MoreVertical, Download, Trash2, Share2, FolderOpen, Eye } from 'lucide-react';
import { Media } from '../../types';
import { useMediaActions } from '../../hooks/useMediaActions';
import MediaPreviewModal from './MediaPreviewModal';
import MediaActionsMenu from './MediaActionsMenu';
import MoveMediaModal from './MoveMediaModal';
import DeleteConfirmModal from '../common/DeleteConfirmModal';
import ShareModal from './ShareModal';

interface MediaCardProps {
  media: Media;
  onDelete?: (id: string) => void;
}

export default function MediaCard({ media }: MediaCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  
  const { mediaUrl, handleDownload, handleDelete, handleMove } = useMediaActions(media);

  const actions = [
    { icon: <Eye />, label: 'View', onClick: () => setShowPreview(true) },
    { icon: <Download />, label: 'Download', onClick: handleDownload },
    { icon: <FolderOpen />, label: 'Move', onClick: () => setShowMoveModal(true) },
    { icon: <Share2 />, label: 'Share', onClick: () => setShowShareModal(true) },
    { icon: <Trash2 />, label: 'Delete', onClick: () => setShowDeleteModal(true) },
  ];

  return (
    <>
      <div
        className="relative group rounded-lg overflow-hidden bg-white shadow-md"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false);
          setShowActions(false);
        }}
      >
        <div 
          className="cursor-pointer" 
          onClick={() => setShowPreview(true)}
        >
          {media.media_type === 'image' ? (
            <img
              src={mediaUrl}
              alt={media.filename}
              className="w-full h-48 object-cover"
            />
          ) : (
            <video
              src={mediaUrl}
              className="w-full h-48 object-cover"
              controls={isHovered}
            />
          )}
        </div>

        {/* Actions Menu Button */}
        <button
          className={`absolute top-2 right-2 p-1 rounded-full bg-white shadow-md
            transition-opacity duration-200 ${isHovered ? 'opacity-100' : 'opacity-0'}`}
          onClick={(e) => {
            e.stopPropagation();
            setShowActions(!showActions);
          }}
        >
          <MoreVertical className="w-4 h-4" />
        </button>

        {/* Actions Menu Dropdown */}
        {showActions && (
          <MediaActionsMenu
            actions={actions}
            onClose={() => setShowActions(false)}
          />
        )}
        
        <div className="p-4">
          <p className="text-sm text-gray-600 truncate">{media.filename}</p>
        </div>
      </div>

      {/* Modals */}
      <MediaPreviewModal
        media={media}
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
      />

      {/* <MoveMediaModal
        media={media}
        isOpen={showMoveModal}
        onClose={() => setShowMoveModal(false)}
        onMove={handleMove}
      /> */}

      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={() => handleDelete(media.id)}
        title="Delete File"
        message="Are you sure you want to delete this file? This action cannot be undone."
      />

      <ShareModal
        media={media}
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
      />
    </>
  );
}