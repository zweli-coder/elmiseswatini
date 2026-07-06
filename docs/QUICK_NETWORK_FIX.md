# 🔧 Quick Network Setup - 5 Minute Fix

## The Problem
✗ Login works on development PC (localhost)
✗ Login fails on other PCs with "Network Error"

## The Solution

### Step 1: Get Your Dev PC's IP Address
On your development PC, open PowerShell and run:
```powershell
ipconfig
```
Find the IPv4 Address (example: `192.168.1.100`)

### Step 2: Create .env File
In the `eswatini_lmis_frontend` folder, create a file named `.env`:

```
REACT_APP_API_URL=http://192.168.1.100:3001/api
```
**Replace `192.168.1.100` with your actual IP from Step 1**

### Step 3: Restart Frontend
Stop and restart the frontend development server:
```bash
cd eswatini_lmis_frontend
npm start
```

### Step 4: On the Other PC
Open browser and go to:
```
http://192.168.1.100:3000
```
(Use the same IP from your dev PC)

### Step 5: Test Login
Try logging in with your employer/admin credentials

---

## ✅ If It Works
Great! You're connected. The other PC can now access your system.

## ❌ If It Still Doesn't Work

### Check 1: Firewall
Windows Firewall → Allow an app through firewall → Allow Node.js

### Check 2: Network Connection
Run on other PC:
```powershell
ping 192.168.1.100
```
Should see responses, not timeouts

### Check 3: Backend Running
On dev PC, make sure backend is running:
```bash
cd eswatini_lmis_backend
npm start
```
Should show "✅ Server running on port 3001"

### Check 4: Browser Console
On other PC, open browser DevTools (F12) → Console
Look for error messages showing the API URL being used

---

## 🎯 Summary

| What | Where | How |
|-----|-------|-----|
| Dev PC IP | `ipconfig` | Copy IPv4 Address |
| Config File | `eswatini_lmis_frontend/.env` | Create and set REACT_APP_API_URL |
| Access | Other PC Browser | Go to `http://[IP]:3000` |
| Backend | Dev PC | Ensure running on port 3001 |

---

## 📝 Notes
- Both PCs must be on the same network (WiFi/LAN)
- Backend listens on all interfaces by default (0.0.0.0:3001)
- Frontend now supports environment-based configuration
- Cache clearing may be needed on other PC (Ctrl+Shift+Delete)
