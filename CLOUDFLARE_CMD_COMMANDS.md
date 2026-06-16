🚀 CLOUDFLARE TUNNEL - EXACT CMD COMMANDS
═══════════════════════════════════════════

Use this if you want LOCAL TUNNEL (doesn't require GitHub push)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

STEP 1: VERIFY YOUR SERVICES ARE RUNNING
═════════════════════════════════════════

Copy and paste this:

docker ps

Press ENTER

Should show 3 containers:
  lmis_frontend
  lmis_backend
  lmis_postgres

If NOT running, run this:

docker compose -f docker-compose.dev.yml up -d

Wait for completion...

✅ Services running!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

STEP 2: DOWNLOAD CLOUDFLARED
════════════════════════════

Go to browser:
https://github.com/cloudflare/cloudflared/releases

Download: cloudflared-windows-amd64.exe

Save to: C:\cloudflared

Extract it

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

STEP 3: OPEN CMD IN CLOUDFLARED FOLDER
═══════════════════════════════════════

Copy and paste this:

cd C:\cloudflared

Press ENTER

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

STEP 4: LOGIN TO CLOUDFLARE
════════════════════════════

Copy and paste this:

cloudflared tunnel login

Press ENTER

A browser window opens → Authorize Cloudflare

Browser shows "Tunnel authenticated"

✅ You're authenticated!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

STEP 5: CREATE TUNNEL
═════════════════════

Copy and paste this:

cloudflared tunnel create lmis

Press ENTER

You see output showing UUID (copy it!)

✅ Tunnel created!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

STEP 6: CREATE CONFIG FILE
══════════════════════════

Open Notepad:

1. Click Windows Start
2. Type: notepad
3. Open it

Copy and paste this:

```yaml
tunnel: lmis
credentials-file: C:\Users\Sukati\.cloudflared\lmis-UUID.json

ingress:
  - hostname: lmis-frontend.lmis.workers.dev
    service: http://localhost:3000
  - hostname: lmis-backend.lmis.workers.dev
    service: http://localhost:3001
  - service: http_status:404
```

Save as:

File → Save As

Filename: config.yml

Location: C:\Users\Sukati\.cloudflared\

⚠️ Make sure file type is ALL FILES, not .txt

✅ Config file created!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

STEP 7: START THE TUNNEL
═════════════════════════

Go back to CMD (in C:\cloudflared folder)

Copy and paste this:

cloudflared tunnel run lmis

Press ENTER

You should see:

  ┌───────────────────────────────────────────┐
  │ Tunnel LMIS running!                      │
  │ Forwarding https://lmis-frontend.lmis.workers.dev
  │ Forwarding https://lmis-backend.lmis.workers.dev
  └───────────────────────────────────────────┘

✅ YOUR APP IS LIVE!

URLs:
  Frontend: https://lmis-frontend.lmis.workers.dev
  Backend:  https://lmis-backend.lmis.workers.dev

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚠️ KEEP CMD WINDOW OPEN!

If you close the CMD window, tunnel stops!

Your PC must stay ON!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

TEST YOUR URLS
══════════════

1. Open phone browser
2. Visit: https://lmis-frontend.lmis.workers.dev
3. Should see your app!

✅ Success!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SHARE WITH TEAM
═══════════════

Frontend: https://lmis-frontend.lmis.workers.dev
Backend:  https://lmis-backend.lmis.workers.dev

Works from:
  ✅ Office WiFi
  ✅ Mobile network
  ✅ Any location

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
