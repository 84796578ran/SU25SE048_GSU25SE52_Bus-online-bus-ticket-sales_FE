"use client";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { Box, Typography, CircularProgress } from "@mui/material";

function BookingConfirmContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "fail">(
    "loading"
  );

  useEffect(() => {
    // Fix case: VNPay (hoặc redirect trung gian) trả về https://localhost gây ERR_SSL_PROTOCOL_ERROR
    if (typeof window !== 'undefined') {
      const isLocal = /^(https:\/\/)?(localhost|127\.0\.0\.1)/i.test(window.location.href);
      if (isLocal && window.location.protocol === 'https:') {
        try {
          const httpUrl = window.location.href.replace('https://', 'http://');
          // Dùng replaceState để tránh thêm history mới rồi reload nhẹ
          window.history.replaceState({}, '', httpUrl);
          // Không reload nếu không cần: trình duyệt đã chấp nhận hiển thị nội dung; nếu resource khác fail thì reload
        } catch (e) {
          // Fallback hard redirect
          window.location.href = window.location.href.replace('https://', 'http://');
        }
      }
    }

    const responseCode = searchParams?.get("vnp_ResponseCode");
    
    if (responseCode === "00") {
      setStatus("success");
      
      // Try to extract referenceId from VNPay response
      const txnRef = searchParams?.get("vnp_TxnRef"); // Transaction reference
      const orderInfo = searchParams?.get("vnp_OrderInfo"); // Order info
      
      console.log("✅ VNPay payment success:", {
        responseCode,
        txnRef,
        orderInfo,
        allParams: Object.fromEntries(searchParams?.entries() || [])
      });
      
      // Try to extract referenceId from transaction reference or order info
      let referenceId: string | null = null;
      if (txnRef) {
        referenceId = txnRef;
      } else if (orderInfo) {
        // Try to extract referenceId from order info if it contains the ID
        const match = orderInfo.match(/(\d{18,})/); // Look for long numeric IDs
        if (match) {
          referenceId = match[1];
        }
      }
      
      // Redirect to booking page with payment success status and referenceId if available
      setTimeout(() => {
        if (referenceId) {
          router.push(`/booking?paymentStatus=success&referenceId=${referenceId}`);
        } else {
          router.push("/booking?paymentStatus=success");
        }
      }, 2000);
    } else {
      setStatus("fail");
      // Get error message from VNPay response
      const errorMessage = searchParams?.get("vnp_Message") || "Thanh toán thất bại hoặc đã bị hủy";
      
      console.log("❌ VNPay payment failed:", {
        responseCode,
        errorMessage,
        allParams: Object.fromEntries(searchParams?.entries() || [])
      });
      
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
        fontFamily: '"Inter", "Segoe UI", Arial, sans-serif',
        background: "linear-gradient(120deg, #f8fafc 0%, #fce4ec 100%)",
      }}
    >
      {status === "loading" && (
        <Box
          sx={{
            background: "#fff",
            borderRadius: "1.5rem",
            boxShadow: "0 4px 28px 0 rgba(0, 0, 0, 0.09), 0 1.5px 4px rgba(120, 120, 120, 0.07)",
            padding: "2.5rem 2rem 2rem 2rem",
            minWidth: "320px",
            maxWidth: "90vw",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "1.4rem",
          }}
        >
          <Box
            sx={{
              width: "48px",
              height: "48px",
              borderRadius: "50%",
              border: "6px solid #f3f3f3",
              borderTop: "6px solid #f48fb1",
              boxShadow: "0 2px 8px rgba(244, 143, 177, 0.08)",
              animation: "spin 0.9s cubic-bezier(0.68, -0.55, 0.27, 1.55) infinite",
              marginBottom: "10px",
              "@keyframes spin": {
                "100%": {
                  transform: "rotate(360deg)",
                },
              },
            }}
          />
          <Typography sx={{ fontSize: "1.12rem", color: "#555", textAlign: "center" }}>
            Đang xác nhận kết quả thanh toán...
          </Typography>
        </Box>
      )}
      {status === "success" && (
        <Box
          sx={{
            background: "#fff",
            borderRadius: "1.5rem",
            boxShadow: "0 4px 28px 0 rgba(0, 0, 0, 0.09), 0 1.5px 4px rgba(120, 120, 120, 0.07)",
            padding: "2.5rem 2rem 2rem 2rem",
            minWidth: "320px",
            maxWidth: "90vw",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "1.4rem",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "linear-gradient(120deg, #e8f5e9 60%, #fff)",
              borderRadius: "50%",
              boxShadow: "0 1px 8px rgba(67, 160, 71, 0.08)",
            }}
          >
            <svg width="64" height="64" fill="none" viewBox="0 0 64 64">
              <circle cx="32" cy="32" r="32" fill="#E8F5E9" />
              <path
                d="M19 33.5L29 43L45 27"
                stroke="#43A047"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Box>
          <Typography sx={{ fontSize: "1.12rem", color: "#2e7d32", fontWeight: 600, letterSpacing: "0.01em", textAlign: "center" }}>
            Thanh toán thành công!
          </Typography>
        </Box>
      )}
      {status === "fail" && (
        <Box
          sx={{
            background: "#fff",
            borderRadius: "1.5rem",
            boxShadow: "0 4px 28px 0 rgba(0, 0, 0, 0.09), 0 1.5px 4px rgba(120, 120, 120, 0.07)",
            padding: "2.5rem 2rem 2rem 2rem",
            minWidth: "320px",
            maxWidth: "90vw",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "1.4rem",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "linear-gradient(120deg, #ffebee 60%, #fff)",
              borderRadius: "50%",
              boxShadow: "0 1px 8px rgba(229, 57, 53, 0.07)",
            }}
          >
            <svg width="64" height="64" fill="none" viewBox="0 0 64 64">
              <circle cx="32" cy="32" r="32" fill="#FFEBEE" />
              <path
                d="M22 22L42 42M42 22L22 42"
                stroke="#E53935"
                strokeWidth="4"
                strokeLinecap="round"
              />
            </svg>
          </Box>
          <Typography sx={{ fontSize: "1.12rem", color: "#b71c1c", fontWeight: 600, letterSpacing: "0.01em", textAlign: "center" }}>
            Thanh toán thất bại hoặc bị hủy.
          </Typography>
          <Typography sx={{ fontSize: "0.9rem", color: "#777", textAlign: "center" }}>
            Đang chuyển hướng để xem chi tiết vé...
          </Typography>
        </Box>
      )}
    </Box>
  );
}

export default function BookingConfirmPage() {
  return (
    <Suspense fallback={
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    }>
      <BookingConfirmContent />
    </Suspense>
  );
}
