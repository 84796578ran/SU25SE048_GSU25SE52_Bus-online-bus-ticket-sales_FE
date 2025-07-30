"use client";
import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

/**
 * Redirect page để xử lý URL case-sensitive từ VNPay
 * Nếu vẫn có request đến /Booking/Confirm, sẽ redirect đến /booking/confirm
 */
export default function BookingConfirmRedirect() {
  const searchParams = useSearchParams();

  useEffect(() => {
    // Lấy tất cả query parameters từ URL hiện tại
    const queryString = searchParams.toString();
    
    console.log("🔄 VNPay Return URL Redirect:", {
      from: "/Booking/Confirm",
      to: "/booking/confirm", 
      queryParams: queryString
    });

    // Redirect đến route chính xác với all query parameters
    const targetUrl = `/booking/confirm${queryString ? `?${queryString}` : ''}`;
    
    console.log("🌐 Redirecting to:", targetUrl);
    window.location.replace(targetUrl);
  }, [searchParams]);

  // Hiển thị loading trong khi redirect
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      flexDirection: 'column',
      backgroundColor: '#f5f5f5'
    }}>
      <div style={{
        width: '40px',
        height: '40px',
        border: '4px solid #f3f3f3',
        borderTop: '4px solid #f48fb1',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
        marginBottom: '20px'
      }}></div>
      <p style={{
        color: '#666',
        fontSize: '16px',
        textAlign: 'center'
      }}>
        Đang xử lý kết quả thanh toán...
      </p>
      
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}