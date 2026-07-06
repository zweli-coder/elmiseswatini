# Public Deployment Guide

## Step 1: Push Images to Docker Hub

First, log in to Docker Hub on your local machine:
```bash
docker login
```

Then tag and push your images:

### Backend
```bash
docker tag my-app-backend:latest YOUR_DOCKER_USERNAME/lmis-backend:latest
docker push YOUR_DOCKER_USERNAME/lmis-backend:latest
```

### Frontend
```bash
docker tag my-app-frontend:latest YOUR_DOCKER_USERNAME/lmis-frontend:latest
docker push YOUR_DOCKER_USERNAME/lmis-frontend:latest
```

Replace `YOUR_DOCKER_USERNAME` with your actual Docker Hub username.

---

## Step 2: Set Up Remote Server

On your remote server (AWS EC2, DigitalOcean, Linode, Azure VM, etc.):

1. Install Docker and Docker Compose:
   ```bash
   # Ubuntu/Debian
   sudo apt-get update
   sudo apt-get install -y docker.io docker-compose-plugin
   sudo usermod -aG docker $USER
   ```

2. Clone your project or copy the compose files:
   ```bash
   git clone https://github.com/your-repo/my-app.git
   cd my-app
   ```

3. Create `.env` file on the server with production values:
   ```bash
   cp .env.production .env
   # Edit .env with secure credentials
   nano .env
   ```

   Update these values:
   - `DOCKER_USERNAME=your_docker_username`
   - `DB_PASSWORD=strong_random_password`
   - `JWT_SECRET=strong_random_secret`

4. Pull and start services:
   ```bash
   docker compose -f docker-compose.prod.yml pull
   docker compose -f docker-compose.prod.yml up -d
   ```

---

## Step 3: Access Your Application

- **Frontend:** `http://your-server-ip:3000` or `http://your-domain.com:3000`
- **Backend API:** `http://your-server-ip:3001` or `http://your-domain.com:3001`

---

## Step 4: (Optional) Add Reverse Proxy for Domain & SSL

Use **Nginx** or **Caddy** to:
- Map a domain name (e.g., `myapp.com`) to your server
- Add SSL certificates (free with Let's Encrypt)
- Run frontend/backend on standard ports (80/443)

### Example Nginx config:
```nginx
upstream backend {
    server localhost:3001;
}

upstream frontend {
    server localhost:3000;
}

server {
    listen 80;
    server_name myapp.com;

    location / {
        proxy_pass http://frontend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /api {
        proxy_pass http://backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

Install Certbot for SSL:
```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d myapp.com
```

---

## Step 5: Monitoring & Maintenance

Monitor logs on the server:
```bash
docker compose -f docker-compose.prod.yml logs -f
```

Update images:
```bash
docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d
```

Stop services:
```bash
docker compose -f docker-compose.prod.yml down
```

---

## Server Recommendations

- **AWS:** EC2 (t3.micro free tier)
- **DigitalOcean:** Droplet ($5/month)
- **Linode:** Nanode ($5/month)
- **Hetzner:** Cloud VPS (€3/month)
- **Azure:** Free tier available

All support Docker out of the box.
