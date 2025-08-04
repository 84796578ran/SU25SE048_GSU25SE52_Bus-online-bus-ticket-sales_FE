"use client";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function BookingConfirmPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "fail">(
    "loading"
  );

  useEffect(() => {
    const responseCode = searchParams?.get("vnp_ResponseCode");
    if (responseCode === "00") {
      setStatus("success");
      // Redirect to home page after 2 seconds with payment success parameter
      setTimeout(() => {
        router.push("/?paymentSuccess=true&message=Thanh toán thành công! Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi.");
      }, 2000);
    } else {
      setStatus("fail");
      // Redirect to home page after 3 seconds with payment failure parameter
      setTimeout(() => {
        router.push("/?paymentFailed=true&message=Thanh toán thất bại hoặc đã bị hủy. Vui lòng thử lại.");
      }, 3000);
    }
  }, [searchParams, router]);

  return (
    <div className="confirm-wrapper">
      {status === "loading" && (
        <div className="confirm-content">
          <div className="spinner"></div>
          <p className="desc">Đang xác nhận kết quả thanh toán...</p>
        </div>
      )}
      {status === "success" && (
        <div className="confirm-content">
          <div className="icon success">
            {/* SVG check */}
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
          </div>
          <p className="desc success-text">Thanh toán thành công!</p>
        </div>
      )}
      {status === "fail" && (
        <div className="confirm-content">
          <div className="icon fail">
            {/* SVG cross */}
            <svg width="64" height="64" fill="none" viewBox="0 0 64 64">
              <circle cx="32" cy="32" r="32" fill="#FFEBEE" />
              <path
                d="M22 22L42 42M42 22L22 42"
                stroke="#E53935"
                strokeWidth="4"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <p className="desc fail-text">Thanh toán thất bại hoặc bị huỷ.</p>
        </div>
      )}
      <style jsx>{`
        .confirm-wrapper {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: "Inter", "Segoe UI", Arial, sans-serif;
          background: linear-gradient(120deg, #f8fafc 0%, #fce4ec 100%);
        }
        .confirm-content {
          background: #fff;
          border-radius: 1.5rem;
          box-shadow: 0 4px 28px 0 rgba(0, 0, 0, 0.09),
            0 1.5px 4px rgba(120, 120, 120, 0.07);
          padding: 2.5rem 2rem 2rem 2rem;
          min-width: 320px;
          max-width: 90vw;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.4rem;
        }
        .spinner {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          border: 6px solid #f3f3f3;
          border-top: 6px solid #f48fb1;
          box-shadow: 0 2px 8px rgba(244, 143, 177, 0.08);
          animation: spin 0.9s cubic-bezier(0.68, -0.55, 0.27, 1.55) infinite;
          margin-bottom: 10px;
        }
        @keyframes spin {
          100% {
            transform: rotate(360deg);
          }
        }
        .icon {
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .icon.success {
          background: linear-gradient(120deg, #e8f5e9 60%, #fff);
          border-radius: 50%;
          box-shadow: 0 1px 8px rgba(67, 160, 71, 0.08);
        }
        .icon.fail {
          background: linear-gradient(120deg, #ffebee 60%, #fff);
          border-radius: 50%;
          box-shadow: 0 1px 8px rgba(229, 57, 53, 0.07);
        }
        .desc {
          font-size: 1.12rem;
          color: #555;
          margin-top: 0.6rem;
          text-align: center;
        }
        .success-text {
          color: #2e7d32;
          font-weight: 600;
          letter-spacing: 0.01em;
        }
        .fail-text {
          color: #b71c1c;
          font-weight: 600;
          letter-spacing: 0.01em;
        }
        @media (max-width: 480px) {
          .confirm-content {
            padding: 1.5rem 0.5rem;
            min-width: unset;
          }
        }
      `}</style>
    </div>
  );
}
