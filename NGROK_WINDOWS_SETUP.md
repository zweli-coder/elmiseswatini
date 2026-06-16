🚀 NGROK SETUP - STEP BY STEP (Windows)
======================================

This guide will expose your LOCAL application to the PUBLIC in 5 minutes!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ VERIFY SERVICES RUNNING
═════════════════════════

Before starting ngrok, make sure your services are running:

On Command Prompt, run:
  docker ps

Should show 3 containers:
  lmis_frontend   (Port 3000)  ✅
  lmis_backend    (Port 3001)  ✅
  lmis_postgres   (Port 5432)  ✅

If not running:
  docker compose -f docker-compose.dev.yml up -d

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

STEP 1: CREATE FREE NGROK ACCOUNT (2 minutes)
═════════════════════════════════════════════

1. Open browser
2. Go to: https://ngrok.com/
3. Click "Sign Up" (top right)
4. Enter:
   - Email: Your email
   - Password: Create password
   - Accept terms
5. Click "Sign Up"
6. Verify your email (check inbox)
7. Login

✅ Account created!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

STEP 2: GET YOUR AUTHTOKEN (1 minute)
═════════════════════════════════════

1. After login, go to: https://dashboard.ngrok.com/get-started/your-authtoken
2. You'll see your authtoken (a long string)
3. Click "Copy" button
4. Save it somewhere (Notepad)

Your token looks like:
  2XXXXXXXXXXXXXXXXXXXXXXXXXXXX

Copy this! You'll need it next.

✅ Authtoken saved!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

STEP 3: DOWNLOAD NGROK (1 minute)
═════════════════════════════════

1. Go to: https://ngrok.com/download
2. Select "Windows" (already selected)
3. Click "Download ngrok for Windows"
4. Save the .zip file

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

STEP 4: INSTALL NGROK (2 minutes)
═════════════════════════════════

1. Find downloaded ngrok zip file
2. Right-click → Extract All
3. Extract to: C:\ngrok (or any folder)
4. You'll see: ngrok.exe

✅ ngrok installed!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

STEP 5: CONFIGURE NGROK (1 minute)
═══════════════════════════════════

1. Open Command Prompt (Windows key → type "cmd" → Enter)
2. Navigate to ngrok folder:
   cd C:\ngrok
3. Add your authtoken:
   ngrok config add-authtoken YOUR_TOKEN_HERE

   (Replace YOUR_TOKEN_HERE with token from Step 2)

   Example:
   ngrok config add-authtoken 2XXXXXXXXXXXXXXXXXXXXXXXXXXXX

4. Press Enter
5. You should see: "Authtoken saved"

✅ ngrok configured!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

STEP 6: EXPOSE FRONTEND (Port 3000) - Terminal 1
════════════════════════════════════════════════

1. Open NEW Command Prompt window
2. Go to ngrok folder:
   cd C:\ngrok
3. Run:
   ngrok http 3000

You should see:
   ┌──────────────────────────────────────────────────────┐
   │ ngrok                                    (Ctrl+C to quit) │
   ├──────────────────────────────────────────────────────┤
   │ Session Status           online                       │
   │ Forwarding               https://XXXX-XXXX.ngrok.io -> http://localhost:3000 │
   └──────────────────────────────────────────────────────┘

⭐ SAVE THIS URL! (example: https://1234-5678-9999.ngrok.io)

This is your PUBLIC FRONTEND URL!

✅ Frontend exposed!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

STEP 7: EXPOSE BACKEND (Port 3001) - Terminal 2
═════════════════════════════════════════════════

1. Open ANOTHER NEW Command Prompt window
2. Go to ngrok folder:
   cd C:\ngrok
3. Run:
   ngrok http 3001

You should see:
   Forwarding               https://YYYY-YYYY.ngrok.io -> http://localhost:3001

⭐ SAVE THIS URL! (example: https://9876-5432-1111.ngrok.io)

This is your PUBLIC BACKEND URL!

✅ Backend exposed!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎉 YOU NOW HAVE PUBLIC URLS!
═════════════════════════════

Frontend URL:  https://XXXX-XXXX-XXXX.ngrok.io
Backend URL:   https://YYYY-YYYY-YYYY.ngrok.io

These work from ANYWHERE:
  ✅ Office WiFi
  ✅ Mobile network (4G/5G)
  ✅ Different locations
  ✅ Anyone with the URL

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

TEST YOUR PUBLIC URLS
═════════════════════

1. Open your phone browser
2. Visit: https://XXXX-XXXX-XXXX.ngrok.io (your frontend URL)
3. Should see your LMIS application
4. Try logging in, creating records, etc.

If it works: ✅ SUCCESS!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SHARE WITH YOUR TEAM
════════════════════

Send them this:

"Our LMIS system is now PUBLIC! Access it at:

Frontend: https://XXXX-XXXX-XXXX.ngrok.io
Backend:  https://YYYY-YYYY-YYYY.ngrok.io

You can access from:
  - Office WiFi
  - Mobile network
  - Anywhere in the world

No login needed (unless you added authentication)"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚠️ IMPORTANT NOTES
═════════════════

1. Keep Command Prompt windows OPEN
2. If you close them, URLs stop working
3. URLs change each time you restart ngrok
4. Your laptop/PC must stay ON

For permanent URLs:
  → Deploy to Google Cloud Run (FREE)
  → Deploy to Heroku/Railway
  → Rent VPS ($5/month)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ TROUBLESHOOTING
══════════════════

Problem: "ngrok: command not found"
Solution: Make sure you're in C:\ngrok folder (cd C:\ngrok)

Problem: "Authtoken invalid"
Solution: Copy token correctly from dashboard, no extra spaces

Problem: "Address already in use"
Solution: Port 3000 or 3001 already running. Run:
  docker ps
  Make sure containers are there

Problem: "Connection refused"
Solution: Services not running. Run:
  docker compose -f docker-compose.dev.yml up -d

Problem: URLs not working after restart
Solution: ngrok creates NEW URLs each time. Update team with new URLs.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎉 NEXT STEPS
════════════

1. Follow steps 1-7 above
2. Get your public URLs
3. Test on phone
4. Share with team
5. Your app is LIVE! 🚀

Questions? All steps are above!

Total time: ~10 minutes
