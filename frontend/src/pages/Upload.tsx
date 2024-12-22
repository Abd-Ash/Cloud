import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../lib/api';
import { Upload as UploadIcon } from 'lucide-react';

export default function Upload() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const folderId = searchParams.get('folder');
  
  const upload = useMutation({
    mutationFn: async (files: File[]) => {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('files', file);
      });
      if (folderId) {
        formData.append('folder_id', folderId);
      }
      return api.post('/media/upload', formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['media'] });
      // Redirect to the gallery, to the same folder if one was selected
      navigate(folderId ? `/?folder=${folderId}` : '/');
    }
  });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    upload.mutate(acceptedFiles);
  }, [upload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Upload Media</h1>
      
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-8
          flex flex-col items-center justify-center
          cursor-pointer transition-colors
          ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-500'}
        `}
      >
        <input {...getInputProps()} />
        <UploadIcon className="w-12 h-12 text-gray-400 mb-4" />
        <p className="text-gray-600">
          {isDragActive
            ? "Drop the files here..."
            : "Drag 'n' drop files here, or click to select files"}
        </p>
      </div>
    </div>
  );
}