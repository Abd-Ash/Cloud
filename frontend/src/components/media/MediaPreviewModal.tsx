import { Dialog } from '../common/Dialog';
import { Media } from '../../types';
import { useMediaActions } from '../../hooks/useMediaActions';

interface MediaPreviewModalProps {
  media: Media;
  isOpen: boolean;
  onClose: () => void;
}

export default function MediaPreviewModal({ media, isOpen, onClose }: MediaPreviewModalProps) {
  const { mediaUrl } = useMediaActions(media);

  return (
    <Dialog isOpen={isOpen} onClose={onClose} maxWidth="max-w-4xl">
      <div className="p-4">
        <h2 className="text-xl font-semibold mb-4">{media.filename}</h2>
        <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
          {media.media_type === 'image' ? (
            <img
              src={mediaUrl}
              alt={media.filename}
              className="w-full h-full object-contain"
            />
          ) : (
            <video
              src={mediaUrl}
              className="w-full h-full"
              controls
              autoPlay
            />
          )}
        </div>
      </div>
    </Dialog>
  );
}