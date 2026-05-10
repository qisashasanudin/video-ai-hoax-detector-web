import { Card, Box, Typography, Chip, LinearProgress } from "@mui/material";

export default function AnalysisCard({
  title,
  scoreMeta,
  label,
  description,
  value,
  score,
}: {
  title: string;
  scoreMeta: {
    percent: string;
    label: string;
    color: "error" | "warning" | "success";
  } | null;
  label: string;
  description: React.ReactNode;
  value: string;
  score: number;
}) {
  return (
    <Card sx={{ p: 3, bgcolor: "white" }}>
      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
        <Typography
          variant="h6"
          sx={{ fontWeight: 700, color: "#111827", mr: 2 }}
        >
          {title}
        </Typography>
        <Chip label={label} color={scoreMeta?.color} size="small" />
      </Box>
      <Typography
        variant="h3"
        sx={{ fontWeight: 700, mb: 2, color: "#111827" }}
      >
        {value}
      </Typography>
      <Typography sx={{ color: "#4b5563", mb: 3, lineHeight: 1.6 }}>
        {description}
      </Typography>
      <LinearProgress
        variant="determinate"
        value={Math.max(0, Math.min(100, score * 100))}
        sx={{
          height: 8,
          borderRadius: 4,
          backgroundColor: "#e5e7eb",
          "& .MuiLinearProgress-bar": {
            borderRadius: 4,
            backgroundColor:
              scoreMeta?.color === "error"
                ? "#ef4444"
                : scoreMeta?.color === "warning"
                  ? "#f59e0b"
                  : "#10b981",
          },
        }}
      />
    </Card>
  );
}
