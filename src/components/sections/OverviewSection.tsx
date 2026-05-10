import React from "react";
import { Box, Card, CardContent, Grid, Paper, Typography } from "@mui/material";
import type { AnalysisResult } from "../../types/analysis";
import RiskTile from "../common/RiskTile";
import SummarySkeleton from "../common/SummarySkeleton";

interface RiskMeta {
  score: number;
  percent: string;
  label: string;
  color: "error" | "warning" | "success";
}

interface OverviewSectionProps {
  result: AnalysisResult;
  url: string;
  aiMeta: RiskMeta | null;
  hoaxMeta: RiskMeta | null;
  misMeta: RiskMeta | null;
  isAnalyzing: boolean;
}

export default function OverviewSection({
  result,
  url,
  aiMeta,
  hoaxMeta,
  misMeta,
  isAnalyzing,
}: OverviewSectionProps) {
  return (
    <Grid container spacing={3} sx={{ mb: 3 }}>
      <Grid item xs={12} xl={5}>
        <Card sx={{ p: 2, minHeight: 400, bgcolor: "white" }}>
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
              <Paper
                elevation={0}
                sx={{ height: 180, borderRadius: 3, mb: 2, bgcolor: "#f3f4f6" }}
              />
            )}
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
              {result.video_title || "Judul video tidak tersedia"}
            </Typography>
            <Typography sx={{ color: "#4b5563", wordBreak: "break-all" }}>
              {url}
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} xl={7}>
        <Card sx={{ p: 3, bgcolor: "#ffffff" }}>
          <Typography
            variant="h6"
            sx={{ fontWeight: 700, mb: 1, color: "#111827" }}
          >
            Ringkasan Risiko Utama
          </Typography>
          <Typography sx={{ color: "#4b5563", mb: 3, lineHeight: 1.7 }}>
            Lihat skor cepat untuk risiko konten AI, hoax, dan misinformasi.
          </Typography>
          <Grid container spacing={2}>
            {isAnalyzing ? (
              [1, 2, 3].map((item) => (
                <Grid item xs={12} md={4} key={item}>
                  <SummarySkeleton />
                </Grid>
              ))
            ) : (
              <>
                <Grid item xs={12} md={4}>
                  <RiskTile
                    label="🤖 Deteksi AI"
                    value={aiMeta?.percent || "-"}
                    meta={aiMeta}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <RiskTile
                    label="🛑 Risiko Hoax"
                    value={hoaxMeta?.percent || "-"}
                    meta={hoaxMeta}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <RiskTile
                    label="⚠️ Risiko Misinformasi"
                    value={misMeta?.percent || "-"}
                    meta={misMeta}
                  />
                </Grid>
              </>
            )}
          </Grid>
        </Card>
      </Grid>
    </Grid>
  );
}
