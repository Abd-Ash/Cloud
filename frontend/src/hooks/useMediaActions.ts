import { useState, useEffect } from 'react';
import { Media } from '../types';
import { useAuthStore } from '../stores/authStore';
import { api } from '../lib/api';

export function useMediaActions(media: Media) {
  const [mediaUrl, setMediaUrl] = useState<string>('');
  const { token } = useAuthStore();

  useEffect(() => {
    const fetchMedia = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/media/${media.id}`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        
        if (!response.ok) throw new Error('Failed to load media');
        
        const blob = await response.blob();
        const objectUrl = URL.createObjectURL(blob);
        setMediaUrl(objectUrl);
      } catch (error) {
        console.error('Failed to load media:', error);
      }
    };

    fetchMedia();
    return () => {
      if (mediaUrl) URL.revokeObjectURL(mediaUrl);
    };
  }, [media.id, token]);

  const handleDownload = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/media/${media.id}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      
      if (!response.ok) throw new Error('Failed to download file');
      
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

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/media/${id}`);
      // Refresh media list after deletion
      window.location.reload();
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  const handleMove = async (folderId: string | null) => {
    try {
      await api.put(`/media/${media.id}/move`, { folder_id: folderId });
      window.location.reload();
    } catch (error) {
      console.error('Move failed:', error);
    }
  };

  return {
    mediaUrl,
    handleDownload,
    handleDelete,
    handleMove,
  };
}