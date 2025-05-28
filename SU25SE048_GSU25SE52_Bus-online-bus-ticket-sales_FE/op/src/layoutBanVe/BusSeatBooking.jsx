import { useEffect, useState } from "react";
import '../layoutBanVe/BusSeatBooking.css';
const BusBooking = () => {
    const busInfo = {
        name: 'Xe Limousine VIP',
        route: 'Hà Nội - Sài Gòn',
        departureTime: "08:00",
        departureDate: "Ngày mai",
        pricePerSeat: 200000
    }
    const [seats, setSeats] = useState([]);
    const [selectedSeats, setSelectedSeats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    // Tạo danh sách ghế ban đầu
    useEffect(() => {
        const fetchSeats = async () => {
            try {
                // Giả lập API call
                // Trong thực tế, bạn sẽ được gọi API thật ở đây
                const mockApiCall = () => {
                    return new Promise((resolve) => {
                        setTimeout(() => {
                            const initialSeats = Array.from({ length: 16 }, (_, i) => ({
                                id: `A${i + 1}`,
                                number: `A${i + 1}`,
                                isAvailable: true,
                                isSelected: false,
                            }));
                            resolve(initialSeats);
                        }, 500);
                    });
                };
                const seatsData = await mockApiCall();
                setSeats(seatsData);
                setLoading(false);
            } catch (err) {
                setError(err.message);
                setLoading(false);
            }
        };
        fetchSeats();
    }, []);
    const handleSeatClick = (seatId) => {
        const seat = seats.find(s => s.id === seatId);
        if (!seat.isAvailable) {
            return;
        }
        const updatedSeats = seats.map(seat => {
            if (seat.id === seatId) {
                return {
                    ...seat,
                    isSelected: !seat.isSelected
                };
            }
            return seat;
        });
        setSeats(updatedSeats);
        // Cập nhật danh sách ghế đã chọn
        const newSelectedSeats = updatedSeats.filter(seat => seat.isSelected)
            .map(seat => seat.id);
        setSelectedSeats(newSelectedSeats);
    };
    const handleBooking = async () => {
        if (selectedSeats.length === 0) {
            alert('Vui lòng chọn ít nhất 1 ghế');
            return;
        }
        try {
            // Giả lập API đặt vé
            // Trong thực tế, bạn sẽ gọi API thật ở đây
            const mockBookingApi = () => {
                return new Promise((resolve) => {
                    setTimeout(() => {
                        resolve({
                            success: true,
                            message: 'Đặt vé thành công!'
                        });
                    }, 1000);
                });
            };
            setLoading(true);
            const response = await mockBookingApi();
            alert(response.message);
            // Cập nhật trạng thái ghế sau khi đặt
            const updatedSeats = seats.map(seat => {
                if (selectedSeats.includes(seat.id)) {
                    return {
                        ...seat,
                        isAvailable: false,
                        isSelected: false
                    };
                }
                return seat;
            });
            setSeats(updatedSeats);
            setSelectedSeats([]);
        } catch (err) {
            alert('Đặt vé thất bại: ' + err.message);
        } finally {
            setLoading(false);
        }
    };
    if (loading) {
        return <div className="loading">Đang tải...</div>
    }
    if (error) {
        return <div className="error">
            Lỗi: {error}
        </div>
    }
    // Chia seats thành các nhóm 4 ghế để hiển thị thành công
    const seatRows = [];
    for (let i = 0; i < seats.length; i += 4) {
        seatRows.push(seats.slice(i, i + 4));
    }
    return (
        <div className="bus-booking-container">
            <h1>Đặt vé xe trực tuyến</h1>
            <div className="bus-info">
                <h2>
                    {busInfo.name} - Tuyến {busInfo.route}
                </h2>
                <p>Khởi hành: {busInfo.departureTime} - {busInfo.departureDate}
                </p>
            </div>
            <div className="seat-selection">
                <h3>Chọn ghế</h3>
                <div className="seat-legend">
                    <div className="legend-item">
                        <div className="legend-color available"></div>
                        <span>Có sẵn</span>
                    </div>
                    <div className="legend-item">
                        <div className="legend-color selected"></div>
                        <span>Đã chọn</span>
                    </div>
                    <div className="legend-item">
                        <div className="legend-color unavailable"></div>
                        <span>Đã bán</span>
                    </div>
                </div>
                <div className="seat-map">
                    {seatRows.map((row, rowIndex) => (
                        <div key={rowIndex} className="seat-row">
                            {row.map(seat => (
                                <div key={seat.id} className={`seat ${!seat.isAvailable ? 'unavailable' : ''} ${seat.isSelected ? 'selected' : ''}`}
                                    onClick={() => handleSeatClick(seat.id)}>
                                    {seat.number}
                                </div>
                            ))}
                        </div>
                    ))}
                </div>

            </div>
            <div className="booking-summary">
                <h3>Thông tin đặt vé</h3>
                <p>
                    Số ghế đã chọn: {selectedSeats.length > 0 ? selectedSeats.length : ''}
                </p>
                <p>
                    Tổng tiền: {selectedSeats.length * busInfo.pricePerSeat} VND (200.000 VND/ghế)
                </p>
                <button onClick={handleBooking}
                    disabled={selectedSeats.length === 0 || loading}>
                    {loading ? 'Đang xử lý...' : 'Đặt vé'}
                </button>
            </div>
        </div>
    )
}
export default BusBooking;