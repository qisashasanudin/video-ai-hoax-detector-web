import React from "react";
import { Box, Alert, Button } from "@mui/material";
import type { AnalysisResult } from "../../types/analysis";
import OverviewSection from "./OverviewSection";
import DetailSection from "./DetailSection";

interface ResultsSectionProps {
  result: AnalysisResult | null;
  url: string;
  analysisPhase: "idle" | "extracting" | "analyzing" | "complete";
  progress: string | null;
  aiMeta: {
    score: number;
    percent: string;
    label: string;
    color: "error" | "warning" | "success";
  } | null;
  hoaxMeta: {
    score: number;
    percent: string;
    label: string;
    color: "error" | "warning" | "success";
  } | null;
  misMeta: {
    score: number;
    percent: string;
    label: string;
    color: "error" | "warning" | "success";
  } | null;
  hasAnalysis: boolean;
  onReset: () => void;
}

export default function ResultsSection({
  result,
  url,
  analysisPhase,
  progress,
  aiMeta,
  hoaxMeta,
  misMeta,
  hasAnalysis,
  onReset,
}: ResultsSectionProps) {
  if (!result) return null;

  return (
    <Box sx={{ mt: 4 }}>
      {result.analysis_error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          Analisis gagal: {result.analysis_error}
        </Alert>
      )}

      {analysisPhase === "analyzing" && (
        <Box sx={{ mb: 3 }}>
          <Alert severity="info" sx={{ mb: 2 }}>
            {progress || "Analisis komprehensif sedang berjalan..."}
          </Alert>
        </Box>
      )}

      <OverviewSection
        result={result}
        url={url}
        aiMeta={aiMeta}
        hoaxMeta={hoaxMeta}
        misMeta={misMeta}
        isAnalyzing={analysisPhase === "analyzing"}
      />

      <DetailSection
        result={result}
        analysisPhase={analysisPhase}
        hasAnalysis={hasAnalysis}
        aiMeta={aiMeta}
        hoaxMeta={hoaxMeta}
        misMeta={misMeta}
        progress={progress}
      />

      <Box sx={{ mt: 3, textAlign: "center" }}>
        <Button
          variant="outlined"
          onClick={onReset}
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
  );
}
