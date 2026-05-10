import { Paper, Skeleton } from "@mui/material";

export default function SummarySkeleton() {
  return (
    <Paper
      elevation={0}
      sx={{ p: 2, borderRadius: 3, minHeight: 170, bgcolor: "#f8fafc" }}
    >
      <Skeleton width="40%" height={24} sx={{ mb: 1 }} />
      <Skeleton width="30%" height={28} sx={{ mb: 2 }} />
      <Skeleton
        variant="rectangular"
        height={10}
        sx={{ borderRadius: 5, mb: 2 }}
      />
      <Skeleton width="80%" height={18} />
    </Paper>
  );
}
