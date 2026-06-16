🚀 GOOGLE CLOUD RUN - COMPLETELY FREE SETUP
============================================

This guide uses ONLY FREE services. No credit card charges!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ FREE SERVICES USED

✓ Google Cloud Run     - 2 million requests/month FREE
✓ Cloud Firestore      - 1GB storage FREE forever
✓ Cloud Storage        - 5GB FREE per month
✓ Cloud Build          - 120 build-minutes/day FREE
✓ HTTPS/SSL            - FREE (included)

Total Monthly Cost: $0.00 (within free tier limits)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

STEP 1: CREATE GOOGLE CLOUD ACCOUNT (5 minutes)
═════════════════════════════════════════════

1. Open: https://cloud.google.com/free
2. Click "Get started for free"
3. Sign in with Google account (or create new)
4. Complete signup:
   - Country: Eswatini (or your location)
   - Accept terms
   - NO credit card required for free tier
5. Verify email

✅ You now have FREE Google Cloud account!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

STEP 2: CREATE NEW PROJECT (3 minutes)
═════════════════════════════════════

1. Go to: https://console.cloud.google.com/
2. Look for project selector (top left, near search)
3. Click "SELECT A PROJECT"
4. Click "NEW PROJECT"
5. Project name: lmis-app
6. Click "CREATE"
7. Wait for creation (1-2 minutes)

✅ Project created!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

STEP 3: ENABLE REQUIRED APIs (5 minutes)
═════════════════════════════════════

In Google Cloud Console:

1. Search for "Cloud Run API"
   └─ Click result
   └─ Click "ENABLE"

2. Search for "Cloud Build API"
   └─ Click result
   └─ Click "ENABLE"

3. Search for "Artifact Registry API"
   └─ Click result
   └─ Click "ENABLE"

4. Search for "Cloud Firestore API"
   └─ Click result
   └─ Click "ENABLE"

✅ APIs enabled!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

STEP 4: DEPLOY BACKEND TO CLOUD RUN (5 minutes)
═════════════════════════════════════

1. In Google Cloud Console, search: "Cloud Run"
2. Click "Cloud Run"
3. Click "CREATE SERVICE"

Fill in:
  Service name:           lmis-backend
  Region:                 us-central1
  Container image URL:    nebula20/lmis-backend:latest
  Authentication:         Allow unauthenticated invocations
  Memory:                 512 MB
  CPU:                    1 vCPU
  Timeout:                3600 seconds

Click "CREATE"
⏳ Wait 3-5 minutes for deployment

✅ Backend deployed!

You'll get a URL like:
  https://lmis-backend-xxxxx-uc.a.run.app

Save this URL!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

STEP 5: DEPLOY FRONTEND TO CLOUD RUN (5 minutes)
═════════════════════════════════════

1. Still in Cloud Run section
2. Click "CREATE SERVICE" again

Fill in:
  Service name:           lmis-frontend
  Region:                 us-central1
  Container image URL:    nebula20/lmis-frontend:latest
  Authentication:         Allow unauthenticated invocations
  Memory:                 256 MB
  CPU:                    1 vCPU
  Timeout:                3600 seconds

Click "CREATE"
⏳ Wait 3-5 minutes for deployment

✅ Frontend deployed!

You'll get a URL like:
  https://lmis-frontend-xxxxx-uc.a.run.app

Save this URL!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

STEP 6: SETUP FREE DATABASE (Firestore) (5 minutes)
═════════════════════════════════════

Option A: Use Firestore (Easier, FREE forever)

1. In Google Cloud Console, search: "Firestore"
2. Click "Firestore"
3. Click "CREATE DATABASE"
4. Location: us-central1
5. Start in test mode (for now)
6. Click "CREATE"

✅ Database ready!

Option B: Use Cloud SQL PostgreSQL (if you want SQL)

1. Search: "Cloud SQL"
2. Click "CREATE INSTANCE"
3. Choose PostgreSQL
4. Machine type: db-f1-micro (FREE tier)
5. Region: us-central1
6. Click "CREATE"

Note: After 3 months, might incur costs. Use Firestore instead.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

STEP 7: TEST YOUR DEPLOYMENT (2 minutes)
═════════════════════════════════════

1. Open frontend URL in browser:
   https://lmis-frontend-xxxxx-uc.a.run.app

2. Should see your React application

3. Test on mobile:
   - Open phone browser
   - Visit same URL
   - Should work! ✅

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ YOUR URLS (SAVE THESE!)
═════════════════════════

Frontend:  https://lmis-frontend-xxxxx-uc.a.run.app
Backend:   https://lmis-backend-xxxxx-uc.a.run.app

Share these with your team!
Anyone can access from any network, device, location.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💰 COST BREAKDOWN (COMPLETELY FREE!)
════════════════════════════════════

Cloud Run:
  - 2 million requests/month  FREE
  - Your usage: ~1,000 req/month
  - Cost: $0

Firestore:
  - 1GB storage            FREE forever
  - 50,000 reads/day       FREE
  - 20,000 writes/day      FREE
  - Your usage: minimal
  - Cost: $0

Cloud Storage:
  - 5GB/month              FREE
  - Your usage: minimal
  - Cost: $0

TOTAL MONTHLY COST: $0.00 ✅

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 WHAT YOU GET (FREE!)
═══════════════════════

✓ Public URLs (globally accessible)
✓ HTTPS/SSL encryption
✓ Auto-scaling (handles traffic spikes)
✓ No server management
✓ No downtime
✓ Database included
✓ 99.95% uptime SLA
✓ Multiple users simultaneously

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⏱️ TOTAL SETUP TIME: ~30 minutes
══════════════════════════════

1. Create account         - 5 mins
2. Create project         - 3 mins
3. Enable APIs            - 5 mins
4. Deploy backend         - 5 mins
5. Deploy frontend        - 5 mins
6. Setup database         - 5 mins
7. Test                   - 2 mins

Total: ~30 minutes to have a LIVE, PUBLIC application!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎯 QUICK COMMANDS (If using gcloud CLI)
════════════════════════════════════════

# Install Google Cloud SDK from:
# https://cloud.google.com/sdk/docs/install

# Authenticate
gcloud auth login

# Set project
gcloud config set project YOUR_PROJECT_ID

# Deploy backend
gcloud run deploy lmis-backend \
  --image nebula20/lmis-backend:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --memory 512Mi

# Deploy frontend
gcloud run deploy lmis-frontend \
  --image nebula20/lmis-frontend:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --memory 256Mi

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚠️ IMPORTANT NOTES
══════════════════

1. NO credit card required for free tier
2. You WON'T be charged
3. Must stay within FREE tier limits:
   - Don't exceed 2 million requests/month
   - Don't use too much storage
   - Stay in us-central1 region

4. If you exceed free tier, Google will notify you
5. You can set budget alerts to be safe

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎉 NEXT STEPS
═════════════

1. Start here: https://cloud.google.com/free
2. Follow steps 1-7 above
3. Test your URLs
4. Share with your team!

You'll have a LIVE application that:
✓ Works from office WiFi
✓ Works from mobile network
✓ Works from anywhere
✓ COSTS NOTHING
✓ SCALABLE
✓ SECURE

Ready? Let's go! 🚀

Questions? This guide covers everything!
