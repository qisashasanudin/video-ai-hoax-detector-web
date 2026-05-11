"use client";

import type {
  AnalysisResult,
  JobResultResponse,
  JobStatus,
} from "../types/analysis";

type AnalyzeRequest = {
  url: string;
  source: "youtube" | "tiktok";
};

type ExtractResponse = {
  job_id: string;
  video_title: string | null;
  video_description: string | null;
  video_thumbnail_url: string | null;
};

type StartAnalysisRequest = {
  job_id: string;
};

const API_BASE_URL: string | undefined = process.env.NEXT_PUBLIC_API_BASE_URL;

function backendEnabled(): boolean {
  return typeof API_BASE_URL === "string" && API_BASE_URL.trim().length > 0;
}

export async function mockExtract(
  req: AnalyzeRequest,
): Promise<ExtractResponse> {
  if (!backendEnabled()) {
    throw new Error(
      "Backend API tidak dikonfigurasi. Set NEXT_PUBLIC_API_BASE_URL untuk mengaktifkan analisis sebenarnya.",
    );
  }

  try {
    const res = await fetch(`${API_BASE_URL}/extract`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(
        `Backend /extract failed (${res.status}): ${text || "unknown error"}`,
      );
    }
    return (await res.json()) as ExtractResponse;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Backend extract failed: ${error.message}`);
    }
    throw new Error(
      "Backend tidak tersedia. Pastikan server backend berjalan.",
    );
  }
}

export async function mockStartAnalysis(
  req: StartAnalysisRequest,
): Promise<{ job_id: string; status: string }> {
  if (!backendEnabled()) {
    throw new Error(
      "Backend API tidak dikonfigurasi. Set NEXT_PUBLIC_API_BASE_URL untuk mengaktifkan analisis sebenarnya.",
    );
  }

  try {
    const res = await fetch(`${API_BASE_URL}/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(
        `Backend /analyze failed (${res.status}): ${text || "unknown error"}`,
      );
    }
    return (await res.json()) as { job_id: string; status: string };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Backend analyze failed: ${error.message}`);
    }
    throw new Error(
      "Backend tidak tersedia. Pastikan server backend berjalan.",
    );
  }
}

export async function mockGetJob(job_id: string): Promise<JobResultResponse> {
  if (!backendEnabled()) {
    return {
      status: "failed",
      result: null,
      error:
        "Backend API tidak dikonfigurasi. Set NEXT_PUBLIC_API_BASE_URL untuk mengaktifkan analisis sebenarnya.",
      progress: null,
    };
  }

  try {
    const res = await fetch(`${API_BASE_URL}/jobs/${job_id}`);
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return {
        status: "failed",
        result: null,
        error: text || `Backend /jobs failed (${res.status})`,
        progress: null,
      };
    }
    return (await res.json()) as JobResultResponse;
  } catch (error) {
    return {
      status: "failed",
      result: null,
      error: "Backend tidak tersedia. Pastikan server backend berjalan.",
      progress: null,
    };
  }
}
