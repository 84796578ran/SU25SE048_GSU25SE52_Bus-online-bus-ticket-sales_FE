"use client";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Box, Typography } from "@mui/material";

function BookingConfirmContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "fail">(
    "loading"
  );

  useEffect(() => {
    const responseCode = searchParams?.get("vnp_ResponseCode");
    if (responseCode === "00") {
      setStatus("success");
      // Redirect to booking page with payment success status
      setTimeout(() => {
        router.push("/booking?paymentStatus=success");
      }, 2000);
    } else {
      setStatus("fail");
      // Get error message from VNPay response
      const errorMessage = searchParams?.get("vnp_Message") || "Thanh toán thất bại hoặc đã bị hủy";
      // Redirect to booking page with payment failure status and error message
      setTimeout(() => {
        router.push(`/booking?paymentStatus=failed&paymentError=${encodeURIComponent(errorMessage)}`);
      }, 3000);
    }
  }, [searchParams, router]);

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
        {status === "loading" && (
          <>
            <Typography variant="h4" sx={{ mb: 2, color: "#333" }}>
              Đang xử lý thanh toán...
            </Typography>
            <Typography variant="body1" sx={{ color: "#666" }}>
              Vui lòng chờ trong giây lát
            </Typography>
          </>
        )}

        {status === "success" && (
          <>
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: "50%",
                backgroundColor: "#4caf50",
                color: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mx: "auto",
                mb: 3,
                fontSize: 40,
              }}
            >
              ✓
            </Box>
            <Typography variant="h4" sx={{ mb: 2, color: "#4caf50" }}>
              Thanh toán thành công!
            </Typography>
            <Typography variant="body1" sx={{ color: "#666", mb: 2 }}>
              Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi.
            </Typography>
            <Typography variant="body2" sx={{ color: "#999" }}>
              Đang chuyển hướng...
            </Typography>
          </>
        )}

        {status === "fail" && (
          <>
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: "50%",
                backgroundColor: "#f44336",
                color: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mx: "auto",
                mb: 3,
                fontSize: 40,
              }}
            >
              ✗
            </Box>
            <Typography variant="h4" sx={{ mb: 2, color: "#f44336" }}>
              Thanh toán thất bại!
            </Typography>
            <Typography variant="body1" sx={{ color: "#666", mb: 2 }}>
              Đã có lỗi xảy ra trong quá trình thanh toán.
            </Typography>
            <Typography variant="body2" sx={{ color: "#999" }}>
              Đang chuyển hướng về trang đặt vé...
            </Typography>
          </>
        )}
      </Box>
    </Box>
  );
}

export default BookingConfirmContent;
