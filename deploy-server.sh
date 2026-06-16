#!/bin/bash

# Eswatini LMIS Deployment Script for Remote Server
# Usage: bash deploy.sh
# This script installs Docker, pulls images, and starts the application

set -e

echo "================================"
echo "LMIS Application Deployment"
echo "================================"
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
   echo "Please run as root: sudo bash deploy.sh"
   exit 1
fi

echo "Step 1: Update system packages..."
apt-get update
apt-get upgrade -y

echo ""
echo "Step 2: Install Docker..."
apt-get install -y docker.io docker-compose-plugin

echo ""
echo "Step 3: Add user to docker group..."
usermod -aG docker $SUDO_USER

echo ""
echo "Step 4: Create project directory..."
mkdir -p /opt/lmis
cd /opt/lmis

echo ""
echo "Step 5: Clone or download project files..."
echo "Please ensure docker-compose.prod.yml and .env are in /opt/lmis"
echo ""
read -p "Press Enter when files are ready..."

echo ""
echo "Step 6: Login to Docker Hub..."
docker login

echo ""
echo "Step 7: Pull application images..."
docker compose -f docker-compose.prod.yml pull

echo ""
echo "Step 8: Create uploads directory..."
mkdir -p eswatini_lmis_backend/uploads
chmod 755 eswatini_lmis_backend/uploads

echo ""
echo "Step 9: Start services..."
docker compose -f docker-compose.prod.yml up -d

echo ""
echo "Step 10: Verify services..."
sleep 5
docker compose -f docker-compose.prod.yml ps

echo ""
echo "================================"
echo "✅ Deployment Complete!"
echo "================================"
echo ""
echo "Services are now running:"
echo "  Frontend: http://$(hostname -I | awk '{print $1}'):3000"
echo "  Backend:  http://$(hostname -I | awk '{print $1}'):3001"
echo "  Database: Port 5432 (internal only)"
echo ""
echo "View logs with:"
echo "  docker compose -f docker-compose.prod.yml logs -f"
echo ""
echo "Stop services with:"
echo "  docker compose -f docker-compose.prod.yml down"
echo ""
