import { Box, Typography, LinearProgress } from "@mui/material";

interface RiskMeta {
  score: number;
  percent: string;
  label: string;
  color: "error" | "warning" | "success";
}

function getRiskStyles(color: "error" | "warning" | "success") {
  const map = {
    error: {
      background: "#fee2e2",
      border: "1px solid #fecaca",
      title: "#b91c1c",
      bar: "#ef4444",
    },
    warning: {
      background: "#fef9c3",
      border: "1px solid #fef08a",
      title: "#92400e",
      bar: "#f59e0b",
    },
    success: {
      background: "#ecfdf5",
      border: "1px solid #bbf7d0",
      title: "#047857",
      bar: "#10b981",
    },
  };
  return map[color];
}

export default function RiskTile({
  label,
  value,
  meta,
}: {
  label: string;
  value: string;
  meta?: RiskMeta | null;
}) {
  const styles = meta
    ? getRiskStyles(meta.color)
    : {
        background: "#f8fafc",
        border: "1px solid #e5e7eb",
        title: "#111827",
        bar: "#10b981",
      };

  return (
    <Box
      sx={{
        p: 2,
        bgcolor: styles.background,
        borderRadius: 3,
        border: styles.border,
        // minHeight: 170,
      }}
    >
      <Typography
        variant="subtitle2"
        sx={{ fontWeight: 700, color: styles.title, mb: 1 }}
      >
        {label}
      </Typography>
      <Typography
        sx={{ color: "#4b5563", mb: 1, fontWeight: 700, fontSize: "1rem" }}
      >
        {value}
      </Typography>
      <Box sx={{ mb: 2 }}>
        <LinearProgress
          variant="determinate"
          value={meta ? meta.score * 100 : 0}
          sx={{
            height: 10,
            borderRadius: 5,
            backgroundColor: "#e5e7eb",
            "& .MuiLinearProgress-bar": {
              borderRadius: 5,
              backgroundColor: styles.bar,
            },
          }}
        />
      </Box>
    </Box>
  );
}
