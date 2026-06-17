# Deploy Backend to Render - Step by Step

## Prerequisites
- GitHub repo pushed (already done)
- Render account (create at render.com)
- Your database URL and password from Render PostgreSQL

## Step 1: Connect Render to GitHub

1. Go to https://dashboard.render.com
2. Click **"New +"** → **"Web Service"**
3. Select **"Deploy an existing repository"**
4. Search for your repo: `my-app`
5. Click **"Connect"**

## Step 2: Configure the Service

In the "Create a new Web Service" form:

- **Name**: `lmis-backend`
- **Environment**: `Docker`
- **Region**: `Oregon` (same as your database)
- **Branch**: `main`
- **Dockerfile Path**: `eswatini_lmis_backend/Dockerfile`
- **Plan**: `Free` (to test) or `Paid` for production

## Step 3: Add Environment Variables

Click **"Advanced"** and add these environment variables:

```
DB_HOST=dpg-d8fb0ca8qa3s738qh880-a.oregon-postgres.render.com
DB_USER=eswatini_lmis_user
DB_NAME=eswatini_lmis
DB_PORT=5432
DB_PASSWORD=YOUR_ACTUAL_PASSWORD_HERE
JWT_SECRET=eswatini_lmis_jwt_secret_2026_secure_key
NODE_ENV=production
PORT=3001
```

**Important**: Replace `YOUR_ACTUAL_PASSWORD_HERE` with your actual Render PostgreSQL password.

## Step 4: Deploy

Click **"Create Web Service"**

Render will:
- Pull your code from GitHub
- Build the Docker image
- Deploy the backend
- Assign you a URL like: `https://lmis-backend-xxxxx.onrender.com`

**Wait 5-10 minutes for deployment to complete.**

## Step 5: Get Your Backend URL

Once deployed, you'll see a URL like:
```
https://lmis-backend-xxxxx.onrender.com
```

## Step 6: Update Frontend

1. Go to your frontend deployment on Render
2. Update the environment variable:
   - `REACT_APP_API_URL`: `https://lmis-backend-xxxxx.onrender.com/api`
3. Redeploy frontend

## Step 7: Test the Connection

Visit your frontend URL (https://elmis-eswatini-qzwo.onrender.com) and try logging in.

If you get a network error:
- Check backend logs on Render Dashboard
- Verify DB_PASSWORD is correct
- Ensure database URL is reachable

## Troubleshooting

**"502 Bad Gateway" error:**
- Backend failed to start. Check logs in Render dashboard.
- Verify all environment variables are set.

**"Network error" on login:**
- Frontend can't reach backend API.
- Verify `REACT_APP_API_URL` includes `/api` at the end.
- Check CORS settings in backend if needed.

**Database connection failed:**
- Verify DB credentials in environment variables.
- Check that the database is still running on Render.
