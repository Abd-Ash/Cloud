export interface Media {
  id: string;
  filename: string;
  media_type: 'image' | 'video';
  folder_id?: string;
  created_at: string;
}

export interface Folder {
  id: string;
  name: string;
  parent_folder_id?: string;
  created_at: string;
}

export interface User {
  id: string;
  email: string;
  created_at: string;
}