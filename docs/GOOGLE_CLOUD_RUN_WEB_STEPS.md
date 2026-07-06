🚀 GOOGLE CLOUD RUN - EXACT STEPS (NO CMD NEEDED!)
══════════════════════════════════════════════════

This is completely WEB-BASED! No command line needed!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

STEP 1: CREATE GOOGLE CLOUD ACCOUNT
═══════════════════════════════════

1. Open browser
2. Go to: https://cloud.google.com/free
3. Click "Get started for free"
4. Sign in with Google account (or create new)
5. Complete signup
6. Accept terms

✅ Account created!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

STEP 2: CREATE NEW PROJECT
═══════════════════════════

1. Go to: https://console.cloud.google.com/
2. Look at top left, see project dropdown (says "My First Project")
3. Click it
4. Click "NEW PROJECT"
5. Project name: lmis-app
6. Click "CREATE"
7. Wait 1-2 minutes

✅ Project created!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

STEP 3: ENABLE APIS
═══════════════════

In Google Cloud Console:

Search #1: "Cloud Run API"
  └─ Click search result
  └─ Click "ENABLE" button
  └─ Wait...

Search #2: "Cloud Build API"
  └─ Click search result
  └─ Click "ENABLE" button
  └─ Wait...

Search #3: "Artifact Registry API"
  └─ Click search result
  └─ Click "ENABLE" button
  └─ Wait...

✅ APIs enabled!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

STEP 4: DEPLOY BACKEND
══════════════════════

In Google Cloud Console:

1. Search for: "Cloud Run"
2. Click "Cloud Run" result
3. Click "CREATE SERVICE" button

Fill in the form:

  Service name:           lmis-backend
  Region:                 us-central1
  Deployed from:          Container image
  Container image URL:    nebula20/lmis-backend:latest
  Authentication:         ☑ Allow unauthenticated invocations
  Memory:                 512 MB
  CPU:                    1 vCPU
  Timeout:                3600 seconds

4. Click "CREATE"
5. Wait 3-5 minutes for deployment

You'll see green checkmark when done!

Copy the Service URL (looks like):
  https://lmis-backend-xxxxx-uc.a.run.app

✅ Backend deployed!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

STEP 5: DEPLOY FRONTEND
═══════════════════════

In Google Cloud Console:

1. Still in Cloud Run
2. Click "CREATE SERVICE" button again

Fill in the form:

  Service name:           lmis-frontend
  Region:                 us-central1
  Container image URL:    nebula20/lmis-frontend:latest
  Authentication:         ☑ Allow unauthenticated invocations
  Memory:                 256 MB
  CPU:                    1 vCPU

3. Click "CREATE"
4. Wait 3-5 minutes for deployment

You'll see green checkmark when done!

Copy the Service URL (looks like):
  https://lmis-frontend-xxxxx-uc.a.run.app

✅ Frontend deployed!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎉 YOU NOW HAVE PUBLIC URLS!
════════════════════════════

Frontend: https://lmis-frontend-xxxxx-uc.a.run.app
Backend:  https://lmis-backend-xxxxx-uc.a.run.app

These work from:
  ✅ Office WiFi
  ✅ Mobile network (4G/5G)
  ✅ Any location
  ✅ Anywhere in world

✅ YOUR APP IS LIVE!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

TEST YOUR APP
═════════════

1. Copy frontend URL
2. Open phone browser
3. Paste URL
4. Should see your LMIS app!
5. Test login, create records, etc.

✅ Works perfectly!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SHARE WITH TEAM
═══════════════

Send them:

Frontend: https://lmis-frontend-xxxxx-uc.a.run.app
Backend:  https://lmis-backend-xxxxx-uc.a.run.app

"Our LMIS is now LIVE! Access from anywhere!

 Works on:
  ✅ Office WiFi
  ✅ Mobile network
  ✅ Anywhere
  
 No login needed (or add auth later)"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ NO CMD NEEDED!
═════════════════

This is completely web-based!

Everything done in Google Cloud Console browser interface!

✅ Easiest deployment!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚠️ DATABASE NOTE
════════════════

Your backend needs PostgreSQL database.

Options:
1. Use Cloud SQL (managed) - easy but costs money after free trial
2. Use Firestore/Firebase - free forever
3. Use Cloud Compute Engine - get free VM for 12 months

For now, backend will work but may need database setup!

See: GOOGLE_CLOUD_FREE_COMPLETE_SETUP.md for database setup

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

TOTAL TIME: 20 minutes
═════════════════════

1. Create account - 3 mins
2. Create project - 3 mins
3. Enable APIs - 3 mins
4. Deploy backend - 5 mins
5. Deploy frontend - 5 mins
6. Test - 1 min

Done! Your app is LIVE and PUBLIC! 🚀

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
