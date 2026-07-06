# Quick Start Guide - Push to GitHub

## Step 1: Initialize Git Repository

```powershell
cd C:\Users\sukati\my-app

# Initialize git (if not already done)
git init
git config user.email "your-email@example.com"
git config user.name "Your Name"

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: Containerized LMIS app with Docker"
```

## Step 2: Create GitHub Repository

1. Go to https://github.com/new
2. Create a new repository named `eswatini-lmis`
3. Do NOT initialize with README, .gitignore, or license
4. Click "Create repository"

## Step 3: Push to GitHub

```powershell
# Add GitHub as remote
git remote add origin https://github.com/YOUR_USERNAME/eswatini-lmis.git

# Rename branch to main (if needed)
git branch -M main

# Push to GitHub
git push -u origin main
```

## Step 4: GitHub Actions CI/CD Setup

After your first push:

1. Go to your repo on GitHub
2. Click **Settings** → **Actions** → **General**
3. Under "Workflow permissions", select:
   - ✓ "Read and write permissions"
   - ✓ "Allow GitHub Actions to create and approve pull requests"
4. Click **Save**

## Step 5: Watch CI/CD Build

1. Go to **Actions** tab in your repo
2. You should see a "Build and Push Docker Images" workflow running
3. Wait for it to complete (green checkmark = success)
4. Images are now on GitHub Container Registry (GHCR)

## Step 6: Pull Images from GHCR

```powershell
# Create .env file for deployment
copy .env.example .env

# Edit .env with your values:
# - DB_PASSWORD: strong password
# - JWT_SECRET: random string (use: openssl rand -base64 32)
# - GITHUB_REPO: your-username/eswatini-lmis

# Log into GHCR (first time only)
echo "${{ secrets.GITHUB_TOKEN }}" | docker login ghcr.io -u YOUR_USERNAME --password-stdin

# Or use Personal Access Token (better for production)
docker login ghcr.io

# Pull and run from GHCR
docker compose -f docker-compose.ghcr.yml up -d
```

## Verify Deployment

```powershell
# Check services are running
docker compose ps

# View backend logs
docker compose logs backend

# Test frontend at http://localhost:3000
# Test backend at http://localhost:3001/health
```

## Images on GHCR

After successful GitHub Actions run, your images are here:
- Frontend: `ghcr.io/YOUR_USERNAME/eswatini-lmis-frontend:latest`
- Backend: `ghcr.io/YOUR_USERNAME/eswatini-lmis-backend:latest`

Each push to `main` branch auto-builds and pushes new `latest` images.

## Troubleshooting

**"Build failed in GitHub Actions"**
- Check the Actions tab → workflow logs
- Common issue: `.dockerignore` patterns (we fixed this)

**"Image not found on GHCR"**
- Verify repo is public (Settings → Visibility)
- Images tagged with branch name + `latest`

**"Cannot connect between services"**
- Backend uses `db` hostname (not localhost)
- All services in same network (`my-app_default`)
- Check: `docker network inspect my-app_default`
