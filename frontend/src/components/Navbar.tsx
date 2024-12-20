import { Link } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { LogOut, Upload, Image } from 'lucide-react';

export default function Navbar() {
  const { logout } = useAuthStore();

  return (
    <nav className="bg-white shadow">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <Image className="w-8 h-8 text-blue-600" />
            <span className="font-semibold text-xl">PhotoCloud</span>
          </Link>
          
          <div className="flex items-center space-x-4">
            <Link
              to="/upload"
              className="flex items-center space-x-1 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
            >
              <Upload className="w-4 h-4" />
              <span>Upload</span>
            </Link>
            
            <button
              onClick={logout}
              className="flex items-center space-x-1 px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}