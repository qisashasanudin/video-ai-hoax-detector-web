# TSD: AI Hoax Video Platform Web

## System summary

The web frontend provides a user interface for submitting YouTube video URLs and visualizing backend analysis results for AI detection and misinformation risk.

## Goals

- Allow users to enter a YouTube URL and submit it for analysis.
- Poll the backend until analysis completes.
- Display AI detection, hoax risk, and misinformation risk scores.
- Present extracted claims and explanations in a clear UI.

## Non-goals

- Full content moderation or automatic takedown decisions.
- Production-ready hosting or scaling.
- HTML output beyond the local developer UI.

## Architecture

### App structure

- `web/src/app/page.tsx`
  - Main page with video input, result summary, and detail sections.

- `web/src/lib/mockApi.ts`
  - Encapsulates API calls to `POST /analyze` and `GET /jobs/{job_id}`.
  - Uses `NEXT_PUBLIC_API_BASE_URL` to build backend requests.

- `web/src/types/analysis.ts`
  - Defines the types for analysis results returned by the backend.

### Data flow

1. User enters a YouTube URL and submits the form.
2. Frontend calls the backend `POST /analyze` endpoint.
3. Backend returns a `job_id`.
4. Frontend polls `GET /jobs/{job_id}` until `status` is `succeeded` or `failed`.
5. The UI renders the returned analysis payload.

## Integration contract

The frontend expects the backend to provide the following fields:

- `ai_detection.score`
- `ai_detection.confidence`
- `ai_detection.explanation`
- `hoax_analysis.score`
- `hoax_analysis.risk_level`
- `hoax_analysis.explanation`
- `misinformation_analysis.score`
- `misinformation_analysis.risk_level`
- `misinformation_analysis.explanation`
- `overall_assessment.recommendation`
- `overall_assessment.key_findings`
- `claims` array

## Environment

The frontend requires:

- `NEXT_PUBLIC_API_BASE_URL`
  - Example: `http://localhost:8000`

## Run instructions

```bash
cd web
npm install
npm run dev
```

Open `http://localhost:3000` to use the UI.

## Notes

- The app is built with Next.js using the app router.
- The frontend focuses on presenting explainable metrics rather than verifying video truth.
- It is a local development interface tied to the backend API.
