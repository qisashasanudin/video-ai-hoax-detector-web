import type { AnalysisResult, JobStatus } from "../types/analysis";
import { mockGetJob } from "./mockApi";

function cleanUrl(url: string) {
  return url.replace(/[\s)\]\}">.,;:]+$/, "");
}

export function formatPercent(score: number) {
  const normalized = Math.max(0, Math.min(1, score));
  const rounded = Math.round(normalized * 1000) / 10;
  const percent = `${rounded.toFixed(1)}%`;
  if (rounded >= 70)
    return {
      score: normalized,
      percent,
      label: "Tinggi",
      color: "error" as const,
    };
  if (rounded >= 40)
    return {
      score: normalized,
      percent,
      label: "Sedang",
      color: "warning" as const,
    };
  return {
    score: normalized,
    percent,
    label: "Rendah",
    color: "success" as const,
  };
}

export function renderTextWithLinks(text: string) {
  const urlPattern = /(https?:\/\/[^\s)\]}]+)/gi;
  const parts: Array<string | { href: string; label: string }> = [];
  let cursor = 0;
  let match: RegExpExecArray | null;

  while ((match = urlPattern.exec(text)) !== null) {
    const start = match.index;
    const end = urlPattern.lastIndex;
    const href = match[1];

    if (start > cursor) {
      parts.push(text.slice(cursor, start));
    }

    parts.push({ href, label: href });
    cursor = end;
  }

  if (cursor < text.length) {
    parts.push(text.slice(cursor));
  }

  return parts.map((part, index) => {
    if (typeof part === "string") {
      return <span key={index}>{part}</span>;
    }

    return (
      <a
        key={`source-${index}`}
        href={cleanUrl(part.href)}
        target="_blank"
        rel="noreferrer"
        style={{ color: "#2563eb", wordBreak: "break-word" }}
      >
        {part.label}
      </a>
    );
  });
}

export async function pollJob(
  jobId: string,
  options: { intervalMs: number; timeoutMs: number },
  setProgress: (progress: string | null) => void,
  setResult: (result: AnalysisResult | null) => void,
) {
  const started = Date.now();

  while (true) {
    const res = await mockGetJob(jobId);
    setProgress(res.progress);
    if (res.result) {
      setResult(res.result);
    }
    if (res.status === "succeeded" || res.status === "failed") return res;

    if (Date.now() - started > options.timeoutMs) {
      return {
        status: "failed" as JobStatus,
        result: null,
        error: "Timeout polling",
        progress: null,
      };
    }

    await new Promise((resolve) => setTimeout(resolve, options.intervalMs));
  }
}
