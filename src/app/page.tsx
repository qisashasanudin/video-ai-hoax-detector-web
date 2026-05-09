"use client";

import React, { useMemo, useState } from "react";
import {
  AppBar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Grid,
  InputAdornment,
  LinearProgress,
  Paper,
  TextField,
  Toolbar,
  Typography,
  Alert,
  Skeleton,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { mockGetJob, mockExtract, mockStartAnalysis } from "../lib/mockApi";
import type { AnalysisResult, JobStatus } from "../types/analysis";

function formatPercent(score: number): {
  percent: string;
  label: string;
  color: "error" | "warning" | "success";
} {
  const rounded = Math.round(Math.max(0, Math.min(1, score)) * 1000) / 10;
  const percent = `${rounded.toFixed(1)}%`;
  if (rounded >= 70) return { percent, label: "Tinggi", color: "error" };
  if (rounded >= 40) return { percent, label: "Sedang", color: "warning" };
  return { percent, label: "Rendah", color: "success" };
}

const urlPattern = /^(https?:\/\/[^\s)}\]]+)$/;

function cleanUrl(url: string) {
  return url.replace(/[\s),\]}">]+$/, "");
}

function AnalysisSkeletonCard() {
  return (
    <Card sx={{ p: 3, bgcolor: "white" }}>
      <Skeleton variant="text" width={80} height={20} sx={{ mb: 2 }} />
      <Skeleton variant="text" width={100} height={40} sx={{ mb: 2 }} />
      <Skeleton
        variant="rectangular"
        height={30}
        sx={{ mb: 2, borderRadius: 1 }}
      />
      <Skeleton variant="rectangular" height={10} sx={{ borderRadius: 5 }} />
    </Card>
  );
}

function AnalysisContentSkeletonCard() {
  return (
    <Card sx={{ p: 3, bgcolor: "white" }}>
      <Skeleton variant="text" width={200} height={28} sx={{ mb: 2 }} />
      <Skeleton variant="text" height={20} sx={{ mb: 1 }} />
      <Skeleton variant="text" height={20} sx={{ mb: 1 }} />
      <Skeleton variant="text" width="80%" height={20} />
    </Card>
  );
}

function renderTextWithLinks(text: string) {
  return text.split(/(https?:\/\/[^\s)}\]]+)/g).map((part, index) => {
    if (urlPattern.test(part)) {
      const href = cleanUrl(part);
      return (
        <a
          key={index}
          href={href}
          target="_blank"
          rel="noreferrer"
          style={{ color: "#2563eb", wordBreak: "break-word" }}
        >
          {href}
        </a>
      );
    }
    return <span key={index}>{part}</span>;
  });
}

async function pollJob(
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

export default function HomePage() {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [progress, setProgress] = useState<string | null>(null);
  const [analysisPhase, setAnalysisPhase] = useState<
    "idle" | "extracting" | "analyzing" | "complete"
  >("idle");

  const aiMeta = useMemo(() => {
    if (!result?.comprehensive_analysis?.ai_detection) return null;
    const score = result.comprehensive_analysis.ai_detection.score;
    return formatPercent(score);
  }, [result]);

  const misMeta = useMemo(() => {
    if (!result?.comprehensive_analysis?.misinformation_analysis) return null;
    const score = result.comprehensive_analysis.misinformation_analysis.score;
    return formatPercent(score);
  }, [result]);

  const hasAnalysis = Boolean(result?.comprehensive_analysis);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setResult(null);
    setShowResults(true);
    setIsRunning(true);
    setProgress(null);
    setAnalysisPhase("extracting");

    if (!url.trim()) {
      setError("Masukkan URL YouTube terlebih dahulu.");
      setIsRunning(false);
      return;
    }

    try {
      // Step 1: Extract video metadata
      setProgress("Mengunduh video dan mengekstrak metadata...");
      const extractRes = await mockExtract({
        url: url.trim(),
        source: "youtube",
      });
      const job_id = extractRes.job_id;

      // Display extracted metadata immediately
      const extractedResult: AnalysisResult = {
        comprehensive_analysis: null,
        analysis_error: null,
        video_title: extractRes.video_title,
        video_description: extractRes.video_description,
        video_thumbnail_url: extractRes.video_thumbnail_url,
      };
      setResult(extractedResult);
      setAnalysisPhase("analyzing");
      setProgress(
        "Metadata video berhasil diunduh. Memulai analisis komprehensif...",
      );

      // Step 2: Start analysis
      await mockStartAnalysis({ job_id });

      // Step 3: Poll for analysis results
      const res = await pollJob(
        job_id,
        { intervalMs: 900, timeoutMs: 300000 },
        setProgress,
        setResult,
      );

      if (res.status === "succeeded" && res.result) {
        setResult(res.result);
        setAnalysisPhase("complete");
      } else {
        setError(res.error ?? "Analisis gagal. Silakan coba lagi.");
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

  const showSearchHero = !showResults || !result;

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f8fafc" }}>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{ bgcolor: "#ffffff", borderBottom: "1px solid #e5e7eb" }}
      >
        <Toolbar sx={{ justifyContent: "center" }}>
          <Typography variant="h6" sx={{ color: "#111827", fontWeight: 700 }}>
            Video Misinfo Detector
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
            Temukan Potensi Konten AI dan Misinformasi
          </Typography>
          <Typography
            sx={{
              maxWidth: 680,
              mx: "auto",
              color: "#6b7280",
              fontSize: "1.05rem",
            }}
          >
            Masukkan URL video YouTube Anda untuk mendapatkan analisis cepat
            pada risiko konten AI dan misinformasi.
          </Typography>
        </Box>

        <Paper
          component="form"
          onSubmit={onSubmit}
          elevation={showSearchHero ? 3 : 1}
          sx={{
            p: 3,
            borderRadius: 5,
            display: "flex",
            alignItems: "center",
            gap: 1,
            flexDirection: { xs: "column", sm: "row" },
            bgcolor: "white",
          }}
        >
          <TextField
            fullWidth
            placeholder="Masukkan URL video YouTube..."
            value={url}
            disabled={isRunning}
            onChange={(event) => setUrl(event.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: "#9ca3af" }} />
                </InputAdornment>
              ),
            }}
            sx={{
              bgcolor: "#f8fafc",
              borderRadius: "999px",
              input: { py: 1.5, color: "#111827" },
            }}
          />

          <Button
            type="submit"
            variant="contained"
            disabled={isRunning}
            sx={{
              borderRadius: "999px",
              width: { xs: "100%", sm: "220px" },
              textTransform: "none",
              fontWeight: 700,
              py: 1.5,
            }}
          >
            {isRunning ? (
              <CircularProgress size={20} sx={{ color: "white" }} />
            ) : (
              "Analisis"
            )}
          </Button>
        </Paper>

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

        {result && (
          <Box sx={{ mt: 4 }}>
            {result.analysis_error ? (
              <Alert severity="error" sx={{ mb: 3 }}>
                Analisis gagal: {result.analysis_error}
              </Alert>
            ) : null}

            {/* Progress indicator */}
            {analysisPhase === "analyzing" && (
              <Box sx={{ mb: 3 }}>
                <Alert severity="info" sx={{ mb: 2 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <CircularProgress size={20} />
                    <Typography>
                      {progress || "Analisis komprehensif sedang berjalan..."}
                    </Typography>
                  </Box>
                </Alert>
              </Box>
            )}

            <Grid container spacing={3}>
              {/* Video Info Card */}
              <Grid item xs={12} lg={5}>
                <Card sx={{ p: 3, minHeight: 430, bgcolor: "white" }}>
                  <CardContent>
                    <Typography
                      variant="subtitle2"
                      sx={{ color: "#6b7280", fontWeight: 700, mb: 2 }}
                    >
                      Video
                    </Typography>
                    {result.video_thumbnail_url ? (
                      <Box
                        component="img"
                        src={result.video_thumbnail_url}
                        alt={result.video_title ?? "Thumbnail video"}
                        sx={{ width: "100%", borderRadius: 3, mb: 2 }}
                      />
                    ) : (
                      <Skeleton
                        variant="rectangular"
                        height={180}
                        sx={{ borderRadius: 3, mb: 2 }}
                      />
                    )}
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                      {result.video_title || <Skeleton width="80%" />}
                    </Typography>
                    <Typography
                      sx={{ color: "#4b5563", wordBreak: "break-all" }}
                    >
                      {url}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              {/* Analysis Cards */}
              <Grid item xs={12} lg={7}>
                <Grid container spacing={3}>
                  {analysisPhase === "analyzing" ? (
                    <>
                      <Grid item xs={12} sm={6}>
                        <AnalysisSkeletonCard />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <AnalysisSkeletonCard />
                      </Grid>
                      <Grid item xs={12}>
                        <AnalysisContentSkeletonCard />
                      </Grid>
                    </>
                  ) : hasAnalysis ? (
                    <>
                      <Grid item xs={12} sm={6}>
                        <Card sx={{ p: 3, minHeight: 220, bgcolor: "white" }}>
                          <Typography
                            variant="subtitle2"
                            sx={{ color: "#6b7280", fontWeight: 700, mb: 1 }}
                          >
                            Deteksi AI
                          </Typography>
                          <Typography
                            variant="h3"
                            sx={{ fontWeight: 700, mb: 1, color: "#111827" }}
                          >
                            {aiMeta?.percent}
                          </Typography>
                          <Chip
                            label={
                              result?.comprehensive_analysis?.ai_detection
                                ?.confidence || "RENDAH"
                            }
                            color={aiMeta?.color}
                            sx={{ mb: 2 }}
                          />
                          <LinearProgress
                            variant="determinate"
                            value={
                              (result?.comprehensive_analysis?.ai_detection
                                ?.score ?? 0) * 100
                            }
                            sx={{
                              height: 10,
                              borderRadius: 5,
                              backgroundColor: "#e5e7eb",
                              "& .MuiLinearProgress-bar": {
                                borderRadius: 5,
                                backgroundColor:
                                  aiMeta?.color === "error"
                                    ? "#ef4444"
                                    : aiMeta?.color === "warning"
                                      ? "#f59e0b"
                                      : "#10b981",
                              },
                            }}
                          />
                        </Card>
                      </Grid>

                      <Grid item xs={12} sm={6}>
                        <Card sx={{ p: 3, minHeight: 220, bgcolor: "white" }}>
                          <Typography
                            variant="subtitle2"
                            sx={{ color: "#6b7280", fontWeight: 700, mb: 1 }}
                          >
                            Risiko Misinformasi
                          </Typography>
                          <Typography
                            variant="h3"
                            sx={{ fontWeight: 700, mb: 1, color: "#111827" }}
                          >
                            {misMeta?.percent}
                          </Typography>
                          <Chip
                            label={
                              result?.comprehensive_analysis
                                ?.misinformation_analysis?.risk_level ||
                              "TIDAK ADA"
                            }
                            color={misMeta?.color}
                            sx={{ mb: 2 }}
                          />
                          <LinearProgress
                            variant="determinate"
                            value={
                              (result?.comprehensive_analysis
                                ?.misinformation_analysis?.score ?? 0) * 100
                            }
                            sx={{
                              height: 10,
                              borderRadius: 5,
                              backgroundColor: "#e5e7eb",
                              "& .MuiLinearProgress-bar": {
                                borderRadius: 5,
                                backgroundColor:
                                  misMeta?.color === "error"
                                    ? "#ef4444"
                                    : misMeta?.color === "warning"
                                      ? "#f59e0b"
                                      : "#10b981",
                              },
                            }}
                          />
                        </Card>
                      </Grid>
                    </>
                  ) : (
                    <Grid item xs={12}>
                      <Card sx={{ p: 3, minHeight: 220, bgcolor: "white" }}>
                        <Typography
                          variant="subtitle2"
                          sx={{ color: "#6b7280", fontWeight: 700, mb: 1 }}
                        >
                          Analisis Komprehensif
                        </Typography>
                        <Typography sx={{ color: "#4b5563" }}>
                          Metadata video tersedia. Analisis komprehensif masih
                          berjalan dan akan muncul setelah selesai.
                        </Typography>
                      </Card>
                    </Grid>
                  )}
                </Grid>
              </Grid>

              {/* Analysis Content Cards */}
              {analysisPhase === "analyzing" ? (
                <>
                  <Grid item xs={12}>
                    <AnalysisContentSkeletonCard />
                  </Grid>
                  <Grid item xs={12}>
                    <AnalysisContentSkeletonCard />
                  </Grid>
                  <Grid item xs={12}>
                    <AnalysisContentSkeletonCard />
                  </Grid>
                </>
              ) : hasAnalysis ? (
                <>
                  <Grid item xs={12}>
                    <Card sx={{ p: 3, bgcolor: "white" }}>
                      <Typography
                        variant="h6"
                        sx={{ fontWeight: 700, mb: 3, color: "#111827" }}
                      >
                        Analisis Deteksi AI
                      </Typography>
                      <Typography
                        sx={{
                          color: "#4b5563",
                          mb: 2,
                          lineHeight: 1.6,
                          whiteSpace: "pre-wrap",
                        }}
                      >
                        {renderTextWithLinks(
                          result?.comprehensive_analysis?.ai_detection
                            ?.explanation || "Analisis AI tidak tersedia.",
                        )}
                      </Typography>
                    </Card>
                  </Grid>

                  <Grid item xs={12}>
                    <Card sx={{ p: 3, bgcolor: "white" }}>
                      <Typography
                        variant="h6"
                        sx={{ fontWeight: 700, mb: 3, color: "#111827" }}
                      >
                        Analisis Risiko Misinformasi
                      </Typography>
                      <Typography
                        sx={{
                          color: "#4b5563",
                          mb: 2,
                          lineHeight: 1.6,
                          whiteSpace: "pre-wrap",
                        }}
                      >
                        {renderTextWithLinks(
                          result?.comprehensive_analysis
                            ?.misinformation_analysis?.explanation ||
                            "Analisis misinformasi tidak tersedia.",
                        )}
                      </Typography>
                    </Card>
                  </Grid>

                  <Grid item xs={12}>
                    <Card sx={{ p: 3, bgcolor: "white" }}>
                      <Typography
                        variant="h6"
                        sx={{ fontWeight: 700, mb: 3, color: "#111827" }}
                      >
                        Rekomendasi dan Temuan Utama
                      </Typography>
                      <Typography
                        sx={{ color: "#4b5563", mb: 3, lineHeight: 1.6 }}
                      >
                        {result?.comprehensive_analysis?.overall_assessment
                          ?.recommendation || "Rekomendasi tidak tersedia."}
                      </Typography>
                      {result?.comprehensive_analysis?.overall_assessment
                        ?.key_findings &&
                        result.comprehensive_analysis.overall_assessment
                          .key_findings.length > 0 && (
                          <Box>
                            <Typography
                              variant="subtitle1"
                              sx={{ fontWeight: 600, mb: 2, color: "#111827" }}
                            >
                              Temuan Utama:
                            </Typography>
                            <Grid container spacing={1}>
                              {result.comprehensive_analysis.overall_assessment.key_findings.map(
                                (finding, index) => (
                                  <Grid item xs={12} md={6} key={index}>
                                    <Paper
                                      elevation={1}
                                      sx={{
                                        p: 2,
                                        bgcolor: "#f8fafc",
                                        borderRadius: 2,
                                        border: "1px solid #e5e7eb",
                                      }}
                                    >
                                      <Typography
                                        sx={{
                                          color: "#4b5563",
                                          fontSize: "0.95rem",
                                        }}
                                      >
                                        • {finding}
                                      </Typography>
                                    </Paper>
                                  </Grid>
                                ),
                              )}
                            </Grid>
                          </Box>
                        )}
                    </Card>
                  </Grid>
                </>
              ) : null}
            </Grid>

            <Box sx={{ mt: 3, textAlign: "center" }}>
              <Button
                variant="outlined"
                onClick={() => {
                  setUrl("");
                  setResult(null);
                  setError(null);
                  setShowResults(false);
                  setAnalysisPhase("idle");
                }}
                sx={{
                  borderRadius: "999px",
                  textTransform: "none",
                  px: 4,
                  py: 1.25,
                }}
              >
                Analisis Video Lain
              </Button>
            </Box>
          </Box>
        )}
      </Container>
    </Box>
  );
}
