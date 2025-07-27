"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Container,
  Box,
  Typography,
  Paper,
  Button,
  Alert,
  AlertTitle,
  CircularProgress,
  Card,
  CardContent,
  Divider,
} from "@mui/material";
import { motion } from "framer-motion";
import {
  CheckCircle,
  Error,
  Home,
  Receipt,
  DirectionsBus,
  AccessTime,
  LocationOn,
  Refresh,
  Support,
} from "@mui/icons-material";
import Link from "next/link";

interface PaymentData {
  vnp_Amount: string;
  vnp_BankCode?: string;
  vnp_BankTranNo?: string;
  vnp_CardType?: string;
  vnp_OrderInfo: string;
  vnp_PayDate?: string;
  vnp_ResponseCode: string;
  vnp_TmnCode: string;
  vnp_TransactionNo?: string;
  vnp_TransactionStatus?: string;
  vnp_TxnRef: string;
  vnp_SecureHash: string;
  vnp_Message?: string;
}

export default function BookingConfirmPage() {
  const searchParams = useSearchParams();
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    // Extract payment parameters from URL
    const paymentParams: PaymentData = {
      vnp_Amount: searchParams.get("vnp_Amount") || "",
      vnp_BankCode: searchParams.get("vnp_BankCode") || "",
      vnp_BankTranNo: searchParams.get("vnp_BankTranNo") || "",
      vnp_CardType: searchParams.get("vnp_CardType") || "",
      vnp_OrderInfo: searchParams.get("vnp_OrderInfo") || "",
      vnp_PayDate: searchParams.get("vnp_PayDate") || "",
      vnp_ResponseCode: searchParams.get("vnp_ResponseCode") || "",
      vnp_TmnCode: searchParams.get("vnp_TmnCode") || "",
      vnp_TransactionNo: searchParams.get("vnp_TransactionNo") || "",
      vnp_TransactionStatus: searchParams.get("vnp_TransactionStatus") || "",
      vnp_TxnRef: searchParams.get("vnp_TxnRef") || "",
      vnp_SecureHash: searchParams.get("vnp_SecureHash") || "",
      vnp_Message: searchParams.get("vnp_Message") || "",
    };

    setPaymentData(paymentParams);

    // Determine if payment was successful
    const success = paymentParams.vnp_ResponseCode === "00" && 
                   paymentParams.vnp_TransactionStatus === "00";
    setIsSuccess(success);
    setLoading(false);

    // Log payment data for debugging
    console.log(success ? "🎉 Payment Success Data:" : "❌ Payment Failure Data:", paymentParams);
  }, [searchParams]);

  const formatAmount = (amount: string) => {
    const numAmount = parseInt(amount);
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(numAmount);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const year = dateString.substring(0, 4);
    const month = dateString.substring(4, 6);
    const day = dateString.substring(6, 8);
    const hour = dateString.substring(8, 10);
    const minute = dateString.substring(10, 12);
    const second = dateString.substring(12, 14);
    
    return `${day}/${month}/${year} ${hour}:${minute}:${second}`;
  };

  const getErrorMessage = (responseCode: string) => {
    const errorMessages: { [key: string]: string } = {
      "07": "Trừ tiền thành công. Giao dịch bị nghi ngờ (liên quan tới lừa đảo, giao dịch bất thường).",
      "09": "Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng chưa đăng ký dịch vụ InternetBanking",
      "13": "Giao dịch không thành công do: Nhập sai mật khẩu xác thực giao dịch (OTP).",
      "24": "Giao dịch không thành công do: Khách hàng hủy giao dịch",
      "51": "Giao dịch không thành công do: Tài khoản của quý khách không đủ số dư để thực hiện giao dịch.",
      "65": "Giao dịch không thành công do: Tài khoản của Quý khách đã vượt quá hạn mức cho phép.",
      "75": "Ngân hàng thanh toán đang bảo trì.",
      "79": "Giao dịch không thành công do: NH gửi yêu cầu đối soát cho VNPAY",
      "99": "Các lỗi khác (lỗi còn lại, không có trong danh sách mã lỗi đã liệt kê)",
    };

    return errorMessages[responseCode] || "Giao dịch không thành công. Vui lòng thử lại sau.";
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
          {/* Header */}
          <Box textAlign="center" mb={4}>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            >
              {isSuccess ? (
                <CheckCircle sx={{ fontSize: 80, color: "success.main", mb: 2 }} />
              ) : (
                <Error sx={{ fontSize: 80, color: "error.main", mb: 2 }} />
              )}
            </motion.div>
            <Typography 
              variant="h4" 
              component="h1" 
              gutterBottom 
              color={isSuccess ? "success.main" : "error.main"} 
              fontWeight="bold"
            >
              {isSuccess ? "Thanh toán thành công!" : "Thanh toán thất bại"}
            </Typography>
            <Typography variant="h6" color="text.secondary">
              {isSuccess 
                ? "Vé xe của bạn đã được đặt thành công"
                : "Rất tiếc, giao dịch thanh toán của bạn không thành công"
              }
            </Typography>
          </Box>

          {/* Alert */}
          <Alert severity={isSuccess ? "success" : "error"} sx={{ mb: 4 }}>
            <AlertTitle>
              {isSuccess ? "Giao dịch hoàn tất" : "Giao dịch không thành công"}
            </AlertTitle>
            {isSuccess 
              ? "Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi. Vé xe đã được xác nhận và gửi đến email của bạn."
              : paymentData && getErrorMessage(paymentData.vnp_ResponseCode)
            }
          </Alert>

          {/* Payment Details */}
          {paymentData && (
            <Card variant="outlined" sx={{ mb: 4 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <Receipt sx={{ mr: 1 }} />
                  Chi tiết giao dịch
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
                  {isSuccess ? (
                    // Success details
                    <>
                      <Box sx={{ flex: "1 1 300px", minWidth: "250px" }}>
                        <Typography variant="body2" color="text.secondary">
                          Mã giao dịch
                        </Typography>
                        <Typography variant="body1" fontWeight="medium">
                          {paymentData.vnp_TransactionNo}
                        </Typography>
                      </Box>
                      <Box sx={{ flex: "1 1 300px", minWidth: "250px" }}>
                        <Typography variant="body2" color="text.secondary">
                          Số tiền
                        </Typography>
                        <Typography variant="body1" fontWeight="medium" color="success.main">
                          {formatAmount(paymentData.vnp_Amount)}
                        </Typography>
                      </Box>
                      <Box sx={{ flex: "1 1 300px", minWidth: "250px" }}>
                        <Typography variant="body2" color="text.secondary">
                          Ngân hàng
                        </Typography>
                        <Typography variant="body1" fontWeight="medium">
                          {paymentData.vnp_BankCode}
                        </Typography>
                      </Box>
                      <Box sx={{ flex: "1 1 300px", minWidth: "250px" }}>
                        <Typography variant="body2" color="text.secondary">
                          Loại thẻ
                        </Typography>
                        <Typography variant="body1" fontWeight="medium">
                          {paymentData.vnp_CardType}
                        </Typography>
                      </Box>
                      <Box sx={{ flex: "1 1 300px", minWidth: "250px" }}>
                        <Typography variant="body2" color="text.secondary">
                          Thời gian thanh toán
                        </Typography>
                        <Typography variant="body1" fontWeight="medium">
                          {formatDate(paymentData.vnp_PayDate || "")}
                        </Typography>
                      </Box>
                      <Box sx={{ flex: "1 1 300px", minWidth: "250px" }}>
                        <Typography variant="body2" color="text.secondary">
                          Mã tham chiếu
                        </Typography>
                        <Typography variant="body1" fontWeight="medium">
                          {paymentData.vnp_TxnRef}
                        </Typography>
                      </Box>
                    </>
                  ) : (
                    // Failure details
                    <>
                      <Box sx={{ flex: "1 1 300px", minWidth: "250px" }}>
                        <Typography variant="body2" color="text.secondary">
                          Mã lỗi
                        </Typography>
                        <Typography variant="body1" fontWeight="medium" color="error.main">
                          {paymentData.vnp_ResponseCode}
                        </Typography>
                      </Box>
                      <Box sx={{ flex: "1 1 300px", minWidth: "250px" }}>
                        <Typography variant="body2" color="text.secondary">
                          Số tiền
                        </Typography>
                        <Typography variant="body1" fontWeight="medium">
                          {formatAmount(paymentData.vnp_Amount)}
                        </Typography>
                      </Box>
                      <Box sx={{ flex: "1 1 300px", minWidth: "250px" }}>
                        <Typography variant="body2" color="text.secondary">
                          Mã tham chiếu
                        </Typography>
                        <Typography variant="body1" fontWeight="medium">
                          {paymentData.vnp_TxnRef}
                        </Typography>
                      </Box>
                      <Box sx={{ flex: "1 1 300px", minWidth: "250px" }}>
                        <Typography variant="body2" color="text.secondary">
                          Thông tin đơn hàng
                        </Typography>
                        <Typography variant="body1" fontWeight="medium">
                          {paymentData.vnp_OrderInfo}
                        </Typography>
                      </Box>
                      {paymentData.vnp_Message && (
                        <Box sx={{ flex: "1 1 100%", width: "100%" }}>
                          <Typography variant="body2" color="text.secondary">
                            Thông báo lỗi
                          </Typography>
                          <Typography variant="body1" fontWeight="medium" color="error.main">
                            {paymentData.vnp_Message}
                          </Typography>
                        </Box>
                      )}
                    </>
                  )}
                </Box>
              </CardContent>
            </Card>
          )}

          {/* Additional Information */}
          <Card variant="outlined" sx={{ mb: 4 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                {isSuccess ? <DirectionsBus sx={{ mr: 1 }} /> : <Support sx={{ mr: 1 }} />}
                {isSuccess ? "Bước tiếp theo" : "Cần hỗ trợ?"}
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              {isSuccess ? (
                // Success next steps
                <>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <AccessTime sx={{ mr: 2, color: "primary.main" }} />
                    <Box>
                      <Typography variant="body1" fontWeight="medium">
                        Kiểm tra email
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Chúng tôi đã gửi thông tin vé xe đến email của bạn
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <LocationOn sx={{ mr: 2, color: "primary.main" }} />
                    <Box>
                      <Typography variant="body1" fontWeight="medium">
                        Đến điểm đón
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Vui lòng đến điểm đón trước giờ khởi hành 30 phút
                      </Typography>
                    </Box>
                  </Box>
                </>
              ) : (
                // Failure help information
                <>
                  <Typography variant="body1" paragraph>
                    Nếu bạn gặp vấn đề với việc thanh toán, vui lòng:
                  </Typography>
                  
                  <Box component="ul" sx={{ pl: 2 }}>
                    <Typography component="li" variant="body2" paragraph>
                      Kiểm tra lại thông tin thẻ/tài khoản ngân hàng
                    </Typography>
                    <Typography component="li" variant="body2" paragraph>
                      Đảm bảo tài khoản có đủ số dư để thực hiện giao dịch
                    </Typography>
                    <Typography component="li" variant="body2" paragraph>
                      Liên hệ ngân hàng để được hỗ trợ nếu cần thiết
                    </Typography>
                    <Typography component="li" variant="body2" paragraph>
                      Thử lại giao dịch sau vài phút
                    </Typography>
                  </Box>
                </>
              )}
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <Box display="flex" gap={2} justifyContent="center" flexWrap="wrap">
            <Button
              component={Link}
              href="/"
              variant="contained"
              size="large"
              startIcon={<Home />}
              sx={{ minWidth: 200 }}
            >
              Về trang chủ
            </Button>
            <Button
              component={Link}
              href="/booking"
              variant="outlined"
              size="large"
              startIcon={isSuccess ? <DirectionsBus /> : <Refresh />}
              sx={{ minWidth: 200 }}
            >
              {isSuccess ? "Đặt vé khác" : "Thử lại"}
            </Button>
          </Box>
        </Paper>
      </motion.div>
    </Container>
  );
} 