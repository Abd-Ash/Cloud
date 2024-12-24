import os
import pwd
import grp
import sys

def setup_storage():
    """Set up the file storage directory with proper permissions"""
    base_path = "/filestore"
    uploads_path = "/filestore/Cloud/uploads"
    
    # Get current user and group
    user = pwd.getpwuid(os.getuid()).pw_name
    group = grp.getgrgid(os.getgid()).gr_name
    
    try:
        # Create base directory if it doesn't exist
        if not os.path.exists(base_path):
            os.makedirs(base_path)
        
        # Create uploads directory
        os.makedirs(uploads_path, exist_ok=True)
        
        # Set permissions (755)
        os.chmod(base_path, 0o755)
        os.chmod(uploads_path, 0o755)
        
        # Set ownership
        os.chown(base_path, os.getuid(), os.getgid())
        os.chown(uploads_path, os.getuid(), os.getgid())
        
        print(f"Storage directories created successfully")
        print(f"Owner: {user}:{group}")
        
    except PermissionError:
        print("Error: Insufficient permissions. Try running with sudo.")
        sys.exit(1)
    except Exception as e:
        print(f"Error setting up storage: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    setup_storage()