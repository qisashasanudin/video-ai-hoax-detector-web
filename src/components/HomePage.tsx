"use client";

import React, { useMemo, useState } from "react";
import {
  AppBar,
  Box,
  Container,
  Toolbar,
  Typography,
  CircularProgress,
  Alert,
} from "@mui/material";
import SearchPanel from "./common/SearchPanel";
import ResultsSection from "./sections/ResultsSection";
import { mockExtract, mockStartAnalysis } from "../lib/mockApi";
import { formatPercent, pollJob } from "../lib/analysisUtils";
import type { AnalysisResult, JobStatus } from "../types/analysis";

type AnalysisPhase = "idle" | "extracting" | "analyzing" | "complete";

export default function HomePage() {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [progress, setProgress] = useState<string | null>(null);
  const [analysisPhase, setAnalysisPhase] = useState<AnalysisPhase>("idle");

  const aiMeta = useMemo(() => {
    if (!result?.comprehensive_analysis?.ai_detection) return null;
    return formatPercent(result.comprehensive_analysis.ai_detection.score);
  }, [result]);

  const misMeta = useMemo(() => {
    if (!result?.comprehensive_analysis?.misinformation_analysis) return null;
    return formatPercent(
      result.comprehensive_analysis.misinformation_analysis.score,
    );
  }, [result]);

  const hoaxMeta = useMemo(() => {
    if (!result?.comprehensive_analysis?.hoax_analysis) return null;
    return formatPercent(result.comprehensive_analysis.hoax_analysis.score);
  }, [result]);

  const hasAnalysis = Boolean(result?.comprehensive_analysis);
  const showSearchHero = !showResults || !result;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setResult(null);
    setShowResults(true);
    setIsRunning(true);
    setProgress(null);
    setAnalysisPhase("extracting");

    if (!url.trim()) {
      setError("Masukkan URL YouTube, TikTok, atau Instagram terlebih dahulu.");
      setIsRunning(false);
      return;
    }

    try {
      setProgress("Mengunduh video...");
      const source = url.includes("tiktok.com") ? "tiktok" : url.includes("instagram.com") ? "instagram" : "youtube";
      const extractRes = await mockExtract({
        url: url.trim(),
        source: source,
      });
      const jobId = extractRes.job_id;

      setResult({
        comprehensive_analysis: null,
        analysis_error: null,
        video_title: extractRes.video_title,
        video_description: extractRes.video_description,
        video_thumbnail_url: extractRes.video_thumbnail_url,
      });
      setAnalysisPhase("analyzing");
      setProgress("Mengekstrak metadata video...");

      await mockStartAnalysis({ job_id: jobId });

      const pollResult = await pollJob(
        jobId,
        { intervalMs: 900, timeoutMs: 300000 },
        setProgress,
        setResult,
      );

      if (pollResult.status === "succeeded" && pollResult.result) {
        setResult(pollResult.result);
        setAnalysisPhase("complete");
      } else {
        setError(pollResult.error ?? "Analisis gagal. Silakan coba lagi.");
        setAnalysisPhase("complete");
      }
    } catch (nativeError) {
      setError(
        nativeError instanceof Error
          ? nativeError.message
          : "Terjadi kesalahan.",
      );
      setAnalysisPhase("complete");
    } finally {
      setIsRunning(false);
      setProgress(null);
    }
  }

  function resetSearch() {
    setUrl("");
    setResult(null);
    setError(null);
    setShowResults(false);
    setAnalysisPhase("idle");
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f8fafc" }}>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{ bgcolor: "#ffffff", borderBottom: "1px solid #e5e7eb" }}
      >
        <Toolbar sx={{ justifyContent: "center" }}>
          <Typography variant="h6" sx={{ color: "#111827", fontWeight: 700 }}>
            AI & Hoax Video Detector
          </Typography>
        </Toolbar>
      </AppBar>

      <Container
        maxWidth="lg"
        sx={{
          minHeight: showSearchHero ? "calc(100vh - 72px)" : undefined,
          display: showSearchHero ? "flex" : undefined,
          flexDirection: showSearchHero ? "column" : undefined,
          justifyContent: showSearchHero ? "center" : undefined,
          py: showSearchHero ? 0 : 4,
        }}
      >
        <Box sx={{ textAlign: "center", mb: showSearchHero ? 6 : 4 }}>
          <Typography
            variant="h3"
            sx={{ fontWeight: 700, mb: 2, color: "#111827" }}
          >
            Deteksi AI, Hoax, dan Misinformasi dalam Video
          </Typography>
          <Typography
            sx={{
              maxWidth: 680,
              mx: "auto",
              color: "#6b7280",
              fontSize: "1.05rem",
            }}
          >
            Analisis komprehensif untuk mendeteksi konten AI, menilai apakah
            video adalah hoax yang sengaja dibuat, dan mengecek apakah narasinya
            menyesatkan.
          </Typography>
        </Box>

        <SearchPanel
          url={url}
          setUrl={setUrl}
          isRunning={isRunning}
          onSubmit={handleSubmit}
        />

        {error && (
          <Box sx={{ mt: 3 }}>
            <Alert severity="error">{error}</Alert>
          </Box>
        )}

        {isRunning && !result && (
          <Box sx={{ mt: 4, textAlign: "center" }}>
            <CircularProgress size={52} />
            <Typography sx={{ mt: 2, color: "#4b5563" }}>
              {progress || "Menganalisis video..."}
            </Typography>
          </Box>
        )}

        <ResultsSection
          result={result}
          url={url}
          analysisPhase={analysisPhase}
          progress={progress}
          aiMeta={aiMeta}
          hoaxMeta={hoaxMeta}
          misMeta={misMeta}
          hasAnalysis={hasAnalysis}
          onReset={resetSearch}
        />
      </Container>
    </Box>
  );
}
