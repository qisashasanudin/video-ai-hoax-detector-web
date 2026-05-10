import React from "react";
import { Box, Card, Chip, Grid, Paper, Typography } from "@mui/material";

import { renderTextWithLinks } from "../../lib/analysisUtils";
import type { AnalysisResult } from "../../types/analysis";
import {
  AnalysisContentSkeletonCard,
  AnalysisSkeletonCard,
} from "../common/SkeletonCards";
import AnalysisCard from "../common/AnalysisCard";

interface DetailSectionProps {
  result: AnalysisResult;
  analysisPhase: "idle" | "extracting" | "analyzing" | "complete";
  hasAnalysis: boolean;
  aiMeta: {
    percent: string;
    label: string;
    color: "error" | "warning" | "success";
  } | null;
  hoaxMeta: {
    percent: string;
    label: string;
    color: "error" | "warning" | "success";
  } | null;
  misMeta: {
    percent: string;
    label: string;
    color: "error" | "warning" | "success";
  } | null;
  progress: string | null;
}

export default function DetailSection({
  result,
  analysisPhase,
  hasAnalysis,
  aiMeta,
  hoaxMeta,
  misMeta,
}: DetailSectionProps) {
  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography
          variant="h5"
          sx={{ fontWeight: 700, mb: 1, color: "#111827" }}
        >
          Detail Analisis
        </Typography>
        <Typography sx={{ color: "#4b5563", mb: 2, lineHeight: 1.6 }}>
          Hasil berikut memberikan penjelasan terpisah untuk AI, hoax, dan
          misinformasi agar Anda dapat memahami risiko dengan lebih jelas. Fokus
          utama kami adalah membantu Anda memahami apakah video ini berisi klaim
          palsu atau cerita yang sengaja dibuat untuk menipu.
        </Typography>
      </Grid>

      {result.claims && result.claims.length > 0 && (
        <Grid item xs={12}>
          <Card sx={{ p: 3, bgcolor: "white" }}>
            <Typography
              variant="h6"
              sx={{ fontWeight: 700, mb: 3, color: "#111827" }}
            >
              🔍 Klaim yang Dianalisis
            </Typography>
            <Typography sx={{ color: "#6b7280", mb: 3, lineHeight: 1.6 }}>
              Berikut adalah klaim-klaim utama yang diekstrak dari video dan
              dianalisis berdasarkan bukti online.
            </Typography>
            <Grid container spacing={2}>
              {result.claims.map((claim, index) => (
                <Grid item xs={12} key={index}>
                  <Paper
                    elevation={1}
                    sx={{
                      p: 3,
                      bgcolor: "#f8fafc",
                      borderRadius: 2,
                      border: "1px solid #e5e7eb",
                    }}
                  >
                    <Typography
                      sx={{
                        color: "#111827",
                        fontSize: "1rem",
                        lineHeight: 1.6,
                      }}
                    >
                      {index + 1}. {claim}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Card>
        </Grid>
      )}

      {analysisPhase === "analyzing" ? (
        <>
          <Grid item xs={12}>
            <AnalysisSkeletonCard />
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
            <AnalysisCard
              title="🤖 Deteksi AI & Deepfake"
              label={
                result.comprehensive_analysis?.ai_detection?.confidence ||
                "RENDAH"
              }
              scoreMeta={aiMeta}
              value={aiMeta?.percent || "-"}
              description={renderTextWithLinks(
                result.comprehensive_analysis?.ai_detection?.explanation ||
                  "Analisis AI tidak tersedia.",
              )}
              score={result.comprehensive_analysis?.ai_detection?.score ?? 0}
            />
          </Grid>

          <Grid item xs={12}>
            <AnalysisCard
              title="🛑 Risiko Hoax"
              label={
                result.comprehensive_analysis?.hoax_analysis?.risk_level ||
                "TIDAK ADA"
              }
              scoreMeta={hoaxMeta}
              value={hoaxMeta?.percent || "-"}
              description={renderTextWithLinks(
                result.comprehensive_analysis?.hoax_analysis?.explanation ||
                  "Analisis hoax tidak tersedia.",
              )}
              score={result.comprehensive_analysis?.hoax_analysis?.score ?? 0}
            />
          </Grid>

          <Grid item xs={12}>
            <AnalysisCard
              title="⚠️ Risiko Misinformasi"
              label={
                result.comprehensive_analysis?.misinformation_analysis
                  ?.risk_level || "TIDAK ADA"
              }
              scoreMeta={misMeta}
              value={misMeta?.percent || "-"}
              description={renderTextWithLinks(
                result.comprehensive_analysis?.misinformation_analysis
                  ?.explanation || "Analisis misinformasi tidak tersedia.",
              )}
              score={
                result.comprehensive_analysis?.misinformation_analysis?.score ??
                0
              }
            />
          </Grid>

          <Grid item xs={12}>
            <Card sx={{ p: 3, bgcolor: "white" }}>
              <Typography
                variant="h6"
                sx={{ fontWeight: 700, mb: 3, color: "#111827" }}
              >
                📋 Rekomendasi dan Temuan Utama
              </Typography>
              <Typography sx={{ color: "#4b5563", mb: 3, lineHeight: 1.6 }}>
                {result.comprehensive_analysis?.overall_assessment
                  ?.recommendation || "Rekomendasi tidak tersedia."}
              </Typography>
              {result.comprehensive_analysis?.overall_assessment
                ?.key_findings && (
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
                              sx={{ color: "#4b5563", fontSize: "0.95rem" }}
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

          <Grid item xs={12}>
            <Card sx={{ p: 3, bgcolor: "white" }}>
              <Typography
                variant="h6"
                sx={{ fontWeight: 700, mb: 2, color: "#111827" }}
              >
                Apa perbedaan Hoax dan Misinformasi?
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Box
                    sx={{
                      p: 2,
                      bgcolor: "#f8fafc",
                      borderRadius: 3,
                      border: "1px solid #e5e7eb",
                    }}
                  >
                    <Typography
                      variant="subtitle2"
                      sx={{ fontWeight: 700, color: "#111827", mb: 1 }}
                    >
                      🛑 Hoax
                    </Typography>
                    <Typography sx={{ color: "#4b5563", lineHeight: 1.7 }}>
                      Cerita atau klaim yang sengaja dibuat tanpa dasar fakta
                      untuk menipu. Hoax biasanya memiliki narasi yang
                      dibuat-buat dan ditujukan untuk mempengaruhi emosi atau
                      keyakinan.
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Box
                    sx={{
                      p: 2,
                      bgcolor: "#fff9db",
                      borderRadius: 3,
                      border: "1px solid #e5e7eb",
                    }}
                  >
                    <Typography
                      variant="subtitle2"
                      sx={{ fontWeight: 700, color: "#111827", mb: 1 }}
                    >
                      ⚠️ Misinformasi
                    </Typography>
                    <Typography sx={{ color: "#4b5563", lineHeight: 1.7 }}>
                      Informasi yang menyesatkan atau tidak lengkap.
                      Misinformasi bisa berisi elemen benar, tetapi cara
                      penyajiannya membuatnya salah kaprah.
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Card>
          </Grid>
        </>
      ) : (
        <Grid item xs={12}>
          <Card sx={{ p: 2, minHeight: 200, bgcolor: "white" }}>
            <Typography
              variant="subtitle2"
              sx={{ color: "#6b7280", fontWeight: 700, mb: 1 }}
            >
              Analisis Komprehensif
            </Typography>
            <Typography sx={{ color: "#4b5563" }}>
              Analisis komprehensif masih berjalan dan akan muncul setelah
              selesai.
            </Typography>
          </Card>
        </Grid>
      )}
    </Grid>
  );
}
