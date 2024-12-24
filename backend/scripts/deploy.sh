#!/bin/bash

# Exit on error
set -e

# Configuration
APP_DIR="/opt/photocloud"
PYTHON_VERSION="3.9"
VENV_DIR="$APP_DIR/backend/venv"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}Starting deployment...${NC}"

# Create application directory
sudo mkdir -p $APP_DIR
sudo chown $USER:$USER $APP_DIR

# Setup storage
echo -e "${GREEN}Setting up storage directories...${NC}"
python3 backend/scripts/setup_storage.py

# Backend setup
echo -e "${GREEN}Setting up backend...${NC}"
cd backend

# Create virtual environment
python3 -m venv $VENV_DIR
source $VENV_DIR/bin/activate

# Install dependencies
pip install -r requirements.txt

# Setup systemd service
sudo tee /etc/systemd/system/photocloud.service << EOF
[Unit]
Description=PhotoCloud Backend
After=network.target

[Service]
User=$USER
Group=$USER
WorkingDirectory=$APP_DIR/backend
Environment="PATH=$VENV_DIR/bin"
ExecStart=$VENV_DIR/bin/uvicorn app.main:app --host 0.0.0.0 --port 5151

[Install]
WantedBy=multi-user.target
EOF

# Reload systemd and start service
sudo systemctl daemon-reload
sudo systemctl enable photocloud
sudo systemctl start photocloud

# Frontend setup
echo -e "${GREEN}Setting up frontend...${NC}"
cd ../frontend

# Install dependencies and build
npm install
npm run build

# Setup nginx
sudo tee /etc/nginx/sites-available/photocloud << EOF
server {
    listen 80;
    server_name your_domain.com;

    location / {
        root $APP_DIR/frontend/dist;
        try_files \$uri \$uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:5151;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

# Enable site
sudo ln -s /etc/nginx/sites-available/photocloud /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

echo -e "${GREEN}Deployment completed successfully!${NC}"