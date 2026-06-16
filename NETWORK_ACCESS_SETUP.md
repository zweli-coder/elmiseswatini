# Network Access Configuration Guide

## Problem
When trying to login from another PC on the network, you get a "Network Error" even though credentials work on the development PC.

## Root Causes
1. Frontend API is hardcoded to `http://localhost:3001/api` (only works on development machine)
2. Backend CORS was restricted to localhost
3. Frontend doesn't know the server's IP address on the network

## Solution

### Step 1: Find Your Development PC's IP Address

**On Windows (Development PC):**
```powershell
ipconfig
```
Look for "IPv4 Address" under your network adapter (usually something like `192.168.x.x` or `10.x.x.x`)

Example: `192.168.1.100`

### Step 2: Update Frontend API Configuration

Two options:

#### Option A: Environment Variables (Recommended)
Create a `.env` file in `eswatini_lmis_frontend/`:
```
REACT_APP_API_URL=http://192.168.1.100:3001/api
```
Replace `192.168.1.100` with your development PC's actual IP address.

#### Option B: Manual Configuration
Update `eswatini_lmis_frontend/src/services/api.js`:
```javascript
import axios from 'axios';

const getAPIBaseURL = () => {
  // Use environment variable if set, otherwise use localhost
  return process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
};

const API = axios.create({
  baseURL: getAPIBaseURL(),
});

// Attach token automatically to every request if it exists
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('lmis_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;
```

### Step 3: Ensure Backend Accepts Network Connections

The backend should already be listening on all interfaces (`0.0.0.0:3001`), which is correct.
Verify in server.js line ~840:
```javascript
const server = app.listen(PORT, '0.0.0.0', () => {
```

### Step 4: On the Other PC

1. **Ensure Network Connectivity**
   - Both PCs should be on the same network
   - Test with ping: `ping 192.168.1.100` (use your dev PC's IP)

2. **Update Frontend URL**
   - If using `.env`: Make sure it has the correct IP
   - If hardcoded: Navigate to `http://192.168.1.100:3000` instead of localhost

3. **Clear Browser Cache**
   - Clear cookies/cache for localhost
   - This removes any old API URL references

4. **Access the Application**
   - Open browser on other PC
   - Go to: `http://192.168.1.100:3000`
   - Try logging in

### Step 5: Firewall Configuration (if still getting errors)

**On Windows (Development PC):**
1. Go to Windows Defender Firewall
2. Click "Allow an app through firewall"
3. Allow Node.js through the firewall on Private networks
4. Or allow ports 3000 and 3001

## Advanced: Production-Ready CORS Configuration

For production, replace the permissive CORS with specific allowed origins:

```javascript
app.use(cors({
    origin: [
        'http://localhost:3000',
        'http://127.0.0.1:3000',
        'http://192.168.1.100:3000',  // Your dev PC IP
        'http://yourdomain.com'         // Your production domain
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
```

## Testing Checklist

✅ Backend running on development PC: `npm start` (in eswatini_lmis_backend)
✅ Frontend running on development PC: `npm start` (in eswatini_lmis_frontend)
✅ Verified IP address of development PC: `ipconfig`
✅ Can ping development PC from other PC
✅ Updated `.env` or API configuration with correct IP
✅ Cleared browser cache on other PC
✅ Firewall allows connections on ports 3000 & 3001
✅ Try login from other PC

## Troubleshooting

**Still getting "Network Error"?**

1. Check network connectivity:
   ```powershell
   ping 192.168.1.100
   ```

2. Verify backend is running:
   ```powershell
   netstat -ano | findstr :3001
   ```

3. Check API URL in browser console (F12 → Console):
   ```javascript
   fetch('http://192.168.1.100:3001/api/auth/me')
     .then(r => r.json())
     .then(d => console.log(d))
   ```

4. Check backend logs for errors

5. Verify CORS settings in server.js

## Common Issues

| Issue | Solution |
|-------|----------|
| "Cannot connect to server" | Check if backend is running, verify IP address |
| "CORS policy blocked" | Ensure wildcard `*` or specific IP in CORS origins |
| "Wrong API URL cached" | Clear browser cache/cookies |
| "Firewall blocked" | Add Node.js to firewall exceptions |
| "Credentials not working" | Ensure you're using same database on both connections |
