import React, { useState, useEffect } from 'react';
import '../bookSeat/SeatBooking.css';

const SeatBooking = () => {
    // Dữ liệu ghế ngồi
    const initialSeats = [
        { id: 1, row: 'R', number: 1, status: 'available' },
        { id: 2, row: 'C', number: 2, status: 'available' },
        { id: 3, row: 'O', number: 3, status: 'available' },
        { id: 4, row: 'L', number: 4, status: 'available' },
        { id: 5, row: 'M', number: 5, status: 'available' },
        { id: 6, row: 'R', number: 6, status: 'available' },
        { id: 7, row: 'T', number: 7, status: 'available' },
        { id: 8, row: 'H', number: 8, status: 'available' },
        { id: 9, row: 'B', number: 9, status: 'available' },
    ];

    const [seats, setSeats] = useState(initialSeats);
    const [selectedSeats, setSelectedSeats] = useState([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    // Hàm xử lý khi click vào ghế
    const handleSeatClick = (seatId) => {
        setSeats(prevSeats =>
            prevSeats.map(seat =>
                seat.id === seatId
                    ? {
                        ...seat,
                        status: seat.status === 'selected' ? 'available' : 'selected',
                    }
                    : seat
            )
        );

        setSelectedSeats(prev =>
            prev.includes(seatId)
                ? prev.filter(id => id !== seatId)
                : [...prev, seatId]
        );
    };

    // Hàm đặt vé
    const bookTickets = async () => {
        if (selectedSeats.length === 0) {
            setMessage('Vui lòng chọn ít nhất một ghế');
            return;
        }

        setLoading(true);
        try {
            // Gọi API để đặt vé
            const response = await fetch('https://api.example.com/bookings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    seatIds: selectedSeats,
                    userId: 'user123', // ID người dùng thực tế
                }),
            });

            const data = await response.json();

            if (response.ok) {
                setMessage('Đặt vé thành công!');
                // Cập nhật trạng thái ghế
                setSeats(prevSeats =>
                    prevSeats.map(seat =>
                        selectedSeats.includes(seat.id) ? { ...seat, status: 'booked' } : seat
                    )
                );
                setSelectedSeats([]);
            } else {
                setMessage(data.message || 'Đặt vé thất bại');
            }
        } catch (error) {
            setMessage('Lỗi kết nối');
        } finally {
            setLoading(false);
        }
    };

    // Hàm lấy màu sắc cho ghế
    const getSeatColor = (status) => {
        switch (status) {
            case 'available':
                return 'var(--seat-available)';
            case 'selected':
                return 'var(--seat-selected)';
            case 'booked':
                return 'var(--seat-booked)';
            default:
                return 'var(--seat-available)';
        }
    };

    return (
        <div className="seat-booking-container">
            <h2>Đặt vé</h2>
            <div className="screen">Màn hình</div>

            <div className="seats-grid">
                {seats.map(seat => (
                    <div
                        key={seat.id}
                        className="seat"
                        style={{ backgroundColor: getSeatColor(seat.status) }}
                        onClick={() => handleSeatClick(seat.id)}
                    >
                        {seat.row}
                    </div>
                ))}
            </div>

            <div className="booking-info">
                <div className="legend">
                    <div className="legend-item">
                        <div className="color-box available"></div>
                        <span>Có sẵn</span>
                    </div>
                    <div className="legend-item">
                        <div className="color-box selected"></div>
                        <span>Đã chọn</span>
                    </div>
                    <div className="legend-item">
                        <div className="color-box booked"></div>
                        <span>Đã đặt</span>
                    </div>
                </div>

                <button
                    onClick={bookTickets}
                    disabled={loading || selectedSeats.length === 0}
                    className="book-button"
                >
                    {loading ? 'Đang xử lý...' : 'Đặt vé'}
                </button>
                {message && <div className="message">{message}</div>}
            </div>
        </div>
    );
};

export default SeatBooking;