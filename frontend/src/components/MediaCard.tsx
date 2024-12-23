import { useState, useEffect } from 'react';
import { Download, Trash2 } from 'lucide-react';
import { Media } from '../types';
import { useAuthStore } from '../stores/authStore';

interface MediaCardProps {
  media: Media;
  onDelete?: (id: string) => void;
}

export default function MediaCard({ media, onDelete }: MediaCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [mediaObjectUrl, setMediaObjectUrl] = useState<string>('');
  const { token } = useAuthStore();

  useEffect(() => {
    const fetchMedia = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/media/${media.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        
        if (!response.ok) {
          throw new Error('Failed to load media');
        }
        
        const blob = await response.blob();
        const objectUrl = URL.createObjectURL(blob);
        setMediaObjectUrl(objectUrl);
      } catch (error) {
        console.error('Failed to load media:', error);
      }
    };

    fetchMedia();

    // Cleanup
    return () => {
      if (mediaObjectUrl) {
        URL.revokeObjectURL(mediaObjectUrl);
      }
    };
  }, [media.id, token]);

  const handleDownload = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/media/${media.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to download file');
      }
      
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = media.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  return (
    <div
      className="relative group rounded-lg overflow-hidden bg-white shadow-md"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {mediaObjectUrl && (
        media.media_type === 'image' ? (
          <img
            src={mediaObjectUrl}
            alt={media.filename}
            className="w-full h-48 object-cover"
          />
        ) : (
          <video
            src={mediaObjectUrl}
            className="w-full h-48 object-cover"
            controls={isHovered}
          />
        )
      )}
      
      <div className={`
        absolute inset-0 bg-black bg-opacity-40
        flex items-center justify-center gap-4
        transition-opacity duration-200
        ${isHovered ? 'opacity-100' : 'opacity-0'}
      `}>
        <button
          onClick={handleDownload}
          className="p-2 rounded-full bg-white text-gray-800 hover:bg-gray-100"
        >
          <Download className="w-5 h-5" />
        </button>
        {onDelete && (
          <button
            onClick={() => onDelete(media.id)}
            className="p-2 rounded-full bg-white text-red-500 hover:bg-gray-100"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        )}
      </div>
      
      <div className="p-4">
        <p className="text-sm text-gray-600 truncate">{media.filename}</p>
      </div>
    </div>
  );
}