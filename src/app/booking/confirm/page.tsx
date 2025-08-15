/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any */
"use client";
import { Suspense } from "react";
import { Box, Typography, CircularProgress } from "@mui/material";
import BookingConfirmContent from "./client-wrapper";

function LoadingFallback() {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        textAlign: "center",
        p: 3,
      }}
    >
      <Box
        sx={{
          backgroundColor: "white",
          borderRadius: 3,
          p: 6,
          boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
          maxWidth: 500,
          width: "100%",
        }}
      >
        <CircularProgress sx={{ mb: 2 }} />
        <Typography variant="h5" sx={{ mb: 2, color: "#333" }}>
          Đang tải...
        </Typography>
        <Typography variant="body1" sx={{ color: "#666" }}>
          Vui lòng chờ trong giây lát
        </Typography>
      </Box>
    </Box>
  );
}

export default function BookingConfirmPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <BookingConfirmContent />
    </Suspense>
  );
}

