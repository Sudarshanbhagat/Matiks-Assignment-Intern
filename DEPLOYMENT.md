# Deployment Guide

## Local Development

### Backend (Go)
```bash
cd backend
go run main.go
# Server runs on http://localhost:8080
```

### Frontend (React Native / Expo)
```bash
cd frontend
npm install
npm start
# Web: http://localhost:3000
# Or scan QR code with Expo Go app
```

---

## GitHub Setup

Repository URL: `https://github.com/Sudarshanbhagat/Matiks-Assignment-Intern.git`

### Push to GitHub
```bash
git add .
git commit -m "Initial commit: Matiks leaderboard system"
git branch -M main
git remote add origin https://github.com/Sudarshanbhagat/Matiks-Assignment-Intern.git
git push -u origin main
```

---

## Netlify Deployment (Frontend Only)

### Option 1: Deploy via Netlify CLI
```bash
npm install -g netlify-cli
cd frontend
netlify deploy --prod
```

### Option 2: Deploy via GitHub Integration
1. Go to [Netlify Dashboard](https://app.netlify.com)
2. Click "New site from Git"
3. Select your GitHub repository
4. Build settings:
   - **Build command**: `cd frontend && npm run build`
   - **Publish directory**: `frontend/dist`
5. Click "Deploy site"

---

## Backend Deployment Options

### Option 1: Render.com (Recommended)
```bash
# Add render.yaml to project root
```

### Option 2: Railway.app
Sign up at railway.app and connect your GitHub repo.

### Option 3: Fly.io
```bash
fly launch
fly deploy
```

---

## Environment Variables

Create a `.env` file in the `frontend/` directory:
```env
REACT_APP_API_BASE_URL=https://your-backend-url.com
```

For Netlify, set these in **Site Settings → Build & Deploy → Environment**:
```
REACT_APP_API_BASE_URL=https://your-backend-url.com
```

---

## Architecture

```
Frontend (Netlify)
    ↓ API calls
Backend (Render/Railway/Fly)
    ↓ processes
In-memory bucket system
```

---

## Testing Production Endpoints

```bash
# Leaderboard
curl https://your-backend-url.com/leaderboard?limit=5

# Search
curl "https://your-backend-url.com/search?username=user_"

# Stats
curl https://your-backend-url.com/stats
```

---

## Troubleshooting

### CORS Issues
Ensure backend has CORS headers enabled (it does by default in main.go).

### Build Failures on Netlify
- Check build logs: **Deploys → select failed deploy → Deploy log**
- Ensure `package.json` exists in `frontend/`
- Verify `npm install` and `npm run build` work locally

### API Calls Fail
- Verify backend URL in `.env`
- Check backend is running (visit `/stats` endpoint)
- Ensure CORS allows your frontend domain

---

## Next Steps

1. ✅ Push code to GitHub
2. ✅ Deploy frontend to Netlify
3. ⏳ Deploy backend to Render/Railway/Fly
4. ⏳ Update API URLs in frontend environment variables
5. ⏳ Test production endpoints
