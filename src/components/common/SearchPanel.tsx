import React from "react";
import { Box, Button, InputAdornment, Paper, TextField } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

interface SearchPanelProps {
  url: string;
  setUrl: (next: string) => void;
  isRunning: boolean;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}

export default function SearchPanel({
  url,
  setUrl,
  isRunning,
  onSubmit,
}: SearchPanelProps) {
  return (
    <Paper
      component="form"
      onSubmit={onSubmit}
      elevation={isRunning ? 3 : 1}
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
        placeholder="Masukkan URL video YouTube atau TikTok..."
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

      <Box sx={{ width: { xs: "100%", sm: "220px" } }}>
        <Button
          type="submit"
          variant="contained"
          disabled={isRunning}
          fullWidth
          sx={{
            borderRadius: "999px",
            textTransform: "none",
            fontWeight: 700,
            py: 1.5,
          }}
        >
          {isRunning ? "Analisis" : "Analisis"}
        </Button>
      </Box>
    </Paper>
  );
}
