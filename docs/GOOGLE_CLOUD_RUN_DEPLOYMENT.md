# Google Cloud Run Deployment Guide for LMIS

## Prerequisites
- Google Cloud account (free tier)
- Docker images on Docker Hub ✅ (nebula20/lmis-backend, nebula20/lmis-frontend)
- Google Cloud SDK installed (gcloud CLI)

---

## Step 1: Install Google Cloud SDK

### Windows
```powershell
# Download from: https://cloud.google.com/sdk/docs/install-sdk
# Or use chocolatey:
choco install google-cloud-sdk
```

### Mac/Linux
```bash
curl https://sdk.cloud.google.com | bash
exec -l $SHELL
```

Then authenticate:
```bash
gcloud auth login
gcloud config set project YOUR_PROJECT_ID
```

Replace `YOUR_PROJECT_ID` with your actual project ID from Google Cloud Console.

---

## Step 2: Deploy Backend to Cloud Run

```bash
gcloud run deploy lmis-backend \
  --image nebula20/lmis-backend:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --memory 512Mi \
  --cpu 1 \
  --set-env-vars DB_USER=postgres,DB_HOST=db,DB_NAME=eswatini_lmis,DB_PASSWORD=YOUR_SECURE_PASSWORD,JWT_SECRET=YOUR_JWT_SECRET,NODE_ENV=production
```

⚠️ **Important:** Replace:
- `YOUR_SECURE_PASSWORD` - Strong random password
- `YOUR_JWT_SECRET` - Generate with: `openssl rand -base64 32`

---

## Step 3: Deploy Frontend to Cloud Run

```bash
gcloud run deploy lmis-frontend \
  --image nebula20/lmis-frontend:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --memory 256Mi \
  --cpu 1
```

---

## Step 4: Deploy Database (Cloud SQL PostgreSQL)

### Option A: Use Cloud SQL (Managed PostgreSQL)

```bash
# Create Cloud SQL instance
gcloud sql instances create lmis-postgres \
  --database-version POSTGRES_16 \
  --tier db-f1-micro \
  --region us-central1

# Create database
gcloud sql databases create eswatini_lmis \
  --instance lmis-postgres

# Create database user
gcloud sql users create postgres \
  --instance lmis-postgres \
  --password YOUR_SECURE_PASSWORD
```

### Option B: Use Cloud Firestore (Simpler, NoSQL)

Skip SQL setup and use Firestore instead (free tier included).

---

## Step 5: Update Backend Connection

Get your Cloud SQL connection string and update backend environment:

```bash
gcloud run services update lmis-backend \
  --update-env-vars DB_HOST=YOUR_CLOUD_SQL_IP \
  --region us-central1
```

---

## Simpler Alternative: Deploy Everything with Docker Compose

Use Google Cloud Compute Engine instead:

```bash
# Create VM instance
gcloud compute instances create lmis-app \
  --image-family ubuntu-2204-lts \
  --image-project ubuntu-os-cloud \
  --machine-type e2-micro \
  --zone us-central1-a

# SSH into instance
gcloud compute ssh lmis-app --zone us-central1-a

# Then run deployment script on the VM
```

---

## Access Your Application

After deployment, you'll get URLs like:

```
Backend:  https://lmis-backend-xxxxx.run.app
Frontend: https://lmis-frontend-xxxxx.run.app
```

---

## Cost (Free Tier)

- Cloud Run: 2 million requests/month FREE
- Cloud SQL: 1 shared instance FREE for 3 months
- Compute Engine: 1 f1-micro instance FREE for 12 months
- Cloud Storage: 5GB FREE

---

## Recommended Setup

For simplicity with free tier:

1. Deploy backend to Cloud Run
2. Deploy frontend to Cloud Run
3. Use Cloud Firestore or managed PostgreSQL
4. Total monthly cost: $0 (within free tier)

---

## Need Help?

- Google Cloud Run Docs: https://cloud.google.com/run/docs
- Cloud SQL Docs: https://cloud.google.com/sql/docs
- Pricing Calculator: https://cloud.google.com/products/calculator
