# Netlify Deployment Quick Start

## Step 1: Connect GitHub to Netlify

1. Go to [netlify.com](https://netlify.com) and sign up (or log in)
2. Click **Add new site → Import an existing project**
3. Select **GitHub** as your Git provider
4. Authorize Netlify to access your GitHub account
5. Select the **Matiks-Assignment-Intern** repository

## Step 2: Configure Build Settings

Netlify will auto-detect settings from `netlify.toml`, but verify:

- **Build command**: `cd frontend && npm run build`
- **Publish directory**: `frontend/dist`
- **Environment variables**: 
  - `REACT_APP_API_BASE_URL` = `http://localhost:8080` (dev) or your backend URL (prod)

## Step 3: Deploy

Click **Deploy site**. Netlify will:
1. Clone your repo
2. Run `npm install` in frontend/
3. Run `npm run build`
4. Deploy the dist folder

Your site will be live at: `https://your-site-name.netlify.app`

## Step 4: Backend Deployment

Frontend is on Netlify. For the backend (Go server), choose one:

### Option A: Render.com (Easiest)
1. Go to [render.com](https://render.com)
2. New → Web Service
3. Connect your GitHub repo
4. Build command: `go build -o server`
5. Start command: `./server`
6. Deploy

### Option B: Railway.app
1. Go to [railway.app](https://railway.app)
2. New Project → GitHub repo
3. Auto-detects Go, deploys automatically

### Option C: Fly.io
```bash
fly launch
fly deploy
```

## Step 5: Connect Frontend to Backend

Once backend is deployed, update `REACT_APP_API_BASE_URL` in Netlify:

1. Go to **Site settings → Build & deploy → Environment**
2. Add variable:
   - Key: `REACT_APP_API_BASE_URL`
   - Value: `https://your-backend.fly.dev` (or Railway/Render URL)
3. Trigger a redeploy

## Status

✅ GitHub repo: https://github.com/Sudarshanbhagat/Matiks-Assignment-Intern
⏳ Frontend: Ready to deploy to Netlify
⏳ Backend: Choose deployment platform above
