export interface Media {
  id: string;
  filename: string;
  media_type: 'image' | 'video';
  created_at: string;
}

export interface User {
  id: string;
  email: string;
  created_at: string;
}