# AI Hoax Video Platform Web UI

Next.js frontend for the Video AI Hoax Detector. This app collects a YouTube, TikTok, or Instagram URL, submits it to the backend, and displays AI, hoax, and misinformation analysis results.

## Setup

```bash
cd web
npm install
```

## Environment

Create `web/.env.local` with:

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

This variable is required for the UI to call the backend API.

## Run the frontend

```bash
cd web
npm run dev
```

Then open `http://localhost:3000` in your browser.

## Architecture

- `web/src/app/page.tsx`
  - Main landing page and form for video submission.

- `web/src/lib/mockApi.ts`
  - Handles API requests to the backend and provides the frontend with data-fetching utilities.

- `web/src/types/analysis.ts`
  - Type definitions for the analysis result payload.

The frontend polls `GET /jobs/{job_id}` after submitting `POST /analyze` and displays the analysis result when it is ready.

## Features

- Submit a YouTube, TikTok, or Instagram video URL.
- Poll backend job status until analysis completes.
- Render AI detection, hoax risk, and misinformation risk.
- Display extracted claims with explanations.

## Integration

The app is designed to work with the `video-ai-hoax-detector-api` backend.
The backend base URL is controlled by `NEXT_PUBLIC_API_BASE_URL`.

If the backend is unavailable, the UI will show an error state instead of analysis results.

## Notes

- The frontend uses Material UI for styling.
- The UI focuses on displaying explainable risk metrics and evidence summaries.
