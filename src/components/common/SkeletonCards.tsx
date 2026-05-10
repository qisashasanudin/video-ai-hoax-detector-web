import React from "react";
import { Card, Skeleton } from "@mui/material";

export function AnalysisSkeletonCard() {
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

export function AnalysisContentSkeletonCard() {
  return (
    <Card sx={{ p: 3, bgcolor: "white" }}>
      <Skeleton variant="text" width={200} height={28} sx={{ mb: 2 }} />
      <Skeleton variant="text" height={20} sx={{ mb: 1 }} />
      <Skeleton variant="text" height={20} sx={{ mb: 1 }} />
      <Skeleton variant="text" width="80%" height={20} />
    </Card>
  );
}
