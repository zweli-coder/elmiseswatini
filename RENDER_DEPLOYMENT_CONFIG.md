# ESWATINI LMIS - Production Deployment URLs

## Render Deployment URLs

### Frontend
- **URL**: https://elmis-eswatini-qzwo.onrender.com
- **File**: eswatini_lmis_frontend/.env
- **Environment Variables**:
  - `REACT_APP_API_URL=https://elmiseswatini-backend.onrender.com`
  - `REACT_APP_FRONTEND_URL=https://elmis-eswatini-qzwo.onrender.com`

### Backend API
- **URL**: https://elmiseswatini-backend.onrender.com
- **File**: eswatini_lmis_backend/.env
- **Key Variables**:
  - `API_URL=https://elmiseswatini-backend.onrender.com`
  - `FRONTEND_URL=https://elmis-eswatini-qzwo.onrender.com`
  - `NODE_ENV=production`

### Database
- **Host**: dpg-d8fb0ca8qa3s738qh880-a.oregon-postgres.render.com
- **Port**: 5432
- **Database**: eswatini_lmis
- **User**: eswatini_lmis_user
- **Region**: Oregon

## Configuration Summary

### What Was Changed

1. **Backend Server** (server.js)
   - Updated CORS to allow production frontend: `https://elmis-eswatini-qzwo.onrender.com`
   - Kept localhost for development testing
   - Removed old frontend URL `https://elmis-eswatini-qzwo.onrender.com` from duplicate

2. **Backend Environment** (.env)
   - `API_URL` changed from `http://localhost:3001` → `https://elmiseswatini-backend.onrender.com`
   - Added `FRONTEND_URL` for reference
   - Database still points to Render Postgres (already configured)

3. **Frontend Environment** (.env)
   - `REACT_APP_API_URL` now: `https://elmiseswatini-backend.onrender.com` (without /api - added by code)
   - Added `REACT_APP_API_BASE` for consistency
   - `NODE_ENV=production`

4. **Frontend API Service** (src/services/api.js)
   - `API_BASE` = `https://elmiseswatini-backend.onrender.com`
   - `API_ENDPOINT` = `${API_BASE}/api`
   - All fetch calls use `API_ENDPOINT` instead of localhost

## API Endpoints

All endpoints follow this pattern:
```
https://elmiseswatini-backend.onrender.com/api/{endpoint}
```

Examples:
- GET /api/jobs
- GET /api/publications
- GET /api/employees
- GET /api/career-advice
- GET /api/economic-sectors
- GET /api/education-training
- GET /api/statistics/summary
- POST /api/auth/register
- POST /api/apply

## Development vs Production

### For Local Development
Set environment variable:
```bash
REACT_APP_API_URL=http://localhost:3001
```

### For Production (Current)
Uses:
```bash
REACT_APP_API_URL=https://elmiseswatini-backend.onrender.com
```

## Deployment Checklist

✅ Frontend URL: https://elmis-eswatini-qzwo.onrender.com
✅ Backend URL: https://elmiseswatini-backend.onrender.com
✅ Database: Render Postgres (Oregon)
✅ CORS configured for production
✅ Environment variables set for production
✅ API endpoints use Render backend
✅ No localhost references in production

## Next Steps

1. Push changes to Git
2. Render will auto-deploy both frontend and backend
3. Test API endpoints on production URLs
4. Monitor logs for any issues
