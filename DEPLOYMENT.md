# Deployment Guide: Vercel (Next.js Frontend)

This guide walks you through deploying the Video AI Hoax Detector Web Frontend to Vercel.

## Prerequisites

- Vercel account (free at https://vercel.com)
- GitHub account with the web repository
- Backend API URL from Oracle Cloud deployment

## Step 1: Connect GitHub to Vercel

1. **Sign in to Vercel**: https://vercel.com/login
2. **Click**: New Project
3. **Select**: Import Git Repository
4. **Authorize** GitHub and select `video-ai-hoax-detector-web`
5. **Click**: Import

## Step 2: Configure Environment Variables

1. In Vercel dashboard, go to your project settings
2. **Scroll to**: Environment Variables
3. **Add**:
   - **Key**: `NEXT_PUBLIC_API_URL`
   - **Value**: `http://<YOUR_ORACLE_IP>:8000`
   - **Scope**: All (Production, Preview, Development)
4. **Save**

## Step 3: Deploy

- Vercel auto-deploys on GitHub push
- First deploy takes ~2-3 minutes
- Your site is now live at `https://<project>.vercel.app`

## Step 4: Update Frontend API Client

Edit `web/src/lib/mockApi.ts`:

```typescript
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
```

This ensures the frontend uses the environment variable in production.

## Step 5: Enable CORS on Backend (if needed)

If you get CORS errors, update the backend `main.py`:

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://<your-vercel-app>.vercel.app", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## Monitoring

1. **Vercel Dashboard**: Real-time logs and analytics
2. **GitHub**: Track deployments via commit history
3. **Vercel CLI** (optional):
   ```bash
   npm i -g vercel
   vercel logs  # View live logs
   ```

## Custom Domain (Optional)

1. In Vercel, go to **Settings → Domains**
2. **Add Domain**: Enter your domain
3. Follow DNS setup instructions

## Automatic Deployments

Vercel auto-deploys on:

- Push to `main` branch
- Pull request to `main` (preview deployment)

## Rollback

```bash
# If you need to rollback to a previous deployment
vercel rollback
```

## Resources

- Vercel Docs: https://vercel.com/docs
- Next.js Docs: https://nextjs.org/docs
- Environment Variables: https://vercel.com/docs/concepts/projects/environment-variables
