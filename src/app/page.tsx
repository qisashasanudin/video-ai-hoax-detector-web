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
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { mockGetJob, mockPostAnalyze } from "../lib/mockApi";
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

const urlPattern = /^(https?:\/\/[^\s]+)$/;

function renderTextWithLinks(text: string) {
  return text.split(/(https?:\/\/[^\s]+)/g).map((part, index) =>
    urlPattern.test(part) ? (
      <a
        key={index}
        href={part}
        target="_blank"
        rel="noreferrer"
        style={{ color: "#2563eb", wordBreak: "break-word" }}
      >
        {part}
      </a>
    ) : (
      <span key={index}>{part}</span>
    ),
  );
}

async function pollJob(
  jobId: string,
  options: { intervalMs: number; timeoutMs: number },
  setProgress: (progress: string | null) => void,
) {
  const started = Date.now();

  while (true) {
    const res = await mockGetJob(jobId);
    setProgress(res.progress);
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

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setResult(null);
    setShowResults(true);
    setIsRunning(true);
    setProgress(null);

    if (!url.trim()) {
      setError("Masukkan URL YouTube terlebih dahulu.");
      setIsRunning(false);
      return;
    }

    try {
      const { job_id } = await mockPostAnalyze({
        url: url.trim(),
        source: "youtube",
      });

      const res = await pollJob(
        job_id,
        { intervalMs: 900, timeoutMs: 60000 },
        setProgress,
      );
      if (res.status === "succeeded" && res.result) {
        setResult(res.result);
      } else {
        setError(res.error ?? "Analisis gagal. Silakan coba lagi.");
      }
    } catch (nativeError) {
      setError(
        nativeError instanceof Error
          ? nativeError.message
          : "Terjadi kesalahan.",
      );
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
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Card sx={{ p: 3, bgcolor: "white" }}>
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
                    ) : null}
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                      {result.video_title || "Video YouTube"}
                    </Typography>
                    {result.video_description ? (
                      <Typography
                        sx={{ color: "#4b5563", mb: 2, whiteSpace: "pre-wrap" }}
                      >
                        {result.video_description}
                      </Typography>
                    ) : null}
                    <Typography
                      sx={{ color: "#4b5563", wordBreak: "break-all" }}
                    >
                      {url}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={8}>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={4}>
                    <Card sx={{ p: 3, bgcolor: "white" }}>
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

                  <Grid item xs={12} sm={4}>
                    <Card sx={{ p: 3, bgcolor: "white" }}>
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
                            ?.misinformation_analysis?.risk_level || "TIDAK ADA"
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
                </Grid>
              </Grid>

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
                      result?.comprehensive_analysis?.misinformation_analysis
                        ?.explanation ||
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
                  <Typography sx={{ color: "#4b5563", mb: 3, lineHeight: 1.6 }}>
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
            </Grid>

            <Box sx={{ mt: 3, textAlign: "center" }}>
              <Button
                variant="outlined"
                onClick={() => {
                  setUrl("");
                  setResult(null);
                  setError(null);
                  setShowResults(false);
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
