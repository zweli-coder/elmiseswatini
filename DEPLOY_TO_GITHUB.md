# Deploying Eswatini LMIS to GitHub via Docker

## Setup Steps

### 1. Initialize GitHub Repository
```bash
cd C:\Users\sukati\my-app
git init
git add .
git commit -m "Initial commit: Containerized LMIS app"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/eswatini-lmis.git
git push -u origin main
```

### 2. GitHub Repository Settings
- Go to **Settings → Actions → General**
- Enable "Read and write permissions" for GitHub Actions
- Go to **Settings → Secrets and variables → Actions**
- Add secrets (if not using `.env`):
  - `DB_PASSWORD`: Your production database password
  - `JWT_SECRET`: A random secure string for JWT signing

### 3. Local Build & Test
```bash
# Build and start all services locally
docker compose up --build

# Check services
docker ps

# View logs
docker compose logs -f backend
docker compose logs -f frontend
```

## Automated CI/CD

The `.github/workflows/docker-push.yml` workflow:
- Triggers on every push to `main` or `develop`
- Builds both frontend and backend images
- Pushes to GitHub Container Registry (GHCR)
- Tags with branch name, commit SHA, and `latest`

### Image Names (after first successful push)
- Frontend: `ghcr.io/YOUR_USERNAME/eswatini-lmis-frontend:latest`
- Backend: `ghcr.io/YOUR_USERNAME/eswatini-lmis-backend:latest`

## Production Deployment

### Using docker-compose.ghcr.yml
```bash
# Create .env from template
cp .env.example .env

# Edit .env with production values
# - DB_PASSWORD: strong password
# - JWT_SECRET: random string
# - GITHUB_REPO: your-username/repo-name

# Pull and start from GHCR
docker compose -f docker-compose.ghcr.yml up -d
```

### Environment Variables
All secrets and config in `.env` file:
- `DB_USER`, `DB_PASSWORD`: PostgreSQL credentials
- `DB_NAME`, `DB_PORT`: Database config
- `JWT_SECRET`: Backend JWT signing key (use `openssl rand -base64 32`)
- `NODE_ENV`: Set to `production`
- `GITHUB_REPO`: Your GitHub repo path

## Verify Deployment

```bash
# Check running containers
docker compose ps

# View backend logs
docker compose logs backend

# Test health endpoints
curl http://localhost:3001/health
curl http://localhost:3000
```

## Troubleshooting

### Images not building
- Check GitHub Actions tab in your repo for logs
- Verify `.dockerignore` files in both services
- Ensure `package.json` files exist in both directories

### Connection refused between services
- Verify services are healthy: `docker compose ps`
- Check network: `docker network inspect my-app_default`
- Ensure backend uses `db` hostname, not `localhost`

### Database won't start
- Check PostgreSQL logs: `docker compose logs db`
- Verify volume mount: `docker volume ls`
- Reset: `docker compose down -v && docker compose up`
