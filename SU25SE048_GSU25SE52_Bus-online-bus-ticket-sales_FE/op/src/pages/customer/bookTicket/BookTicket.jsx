import { useEffect, useState } from "react";
import "../bookTicket/BookTicket.css";
import { useLocation } from "react-router-dom";

const TicketBooking = () => {
    const location = useLocation();
    const { trip, isTransfer = false, secondTrip = null } = location.state || {};
    const [selectedSeats, setSelectedSeats] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [bookedSeats, setBookedSeats] = useState([]);
    const [confirmedSeats, setConfirmedSeats] = useState([]);
    const [reservedSeats, setReservedSeats] = useState([]);
    const [form, setForm] = useState({
        fullName: "",
        phone: "",
        email: "",
        pickUp: trip?.FromLocation || "",
        dropOff: trip?.EndLocation || "",
    });
    useEffect(() => {
        const fetchBookedSeats = async () => {
            try {
                const response = await fetch("https://683ac9b843bb370a8673bd67.mockapi.io/api/BusRoutes/Ticket");
                const data = await response.json();
                setReservedSeats(data.bookedSeats || []);
            } catch (error) {
                console.error("Error fetching booked seats:", error);
            } finally {
                setIsLoading(false);
            }
        };
        if (trip?.id) {
            fetchBookedSeats();
        }
    }, [trip?.id]);
    const handleSeatClick = (seatNumber) => {
        if (bookedSeats.includes(seatNumber) || confirmedSeats.includes(seatNumber)) {
            return;
        }

        if (isTransfer) {
            // For transfer trips, allow selecting 2 seats (one for each trip)
            if (selectedSeats.length < 2) {
                if (!selectedSeats.includes(seatNumber)) {
                    setSelectedSeats([...selectedSeats, seatNumber]);
                } else {
                    setSelectedSeats(selectedSeats.filter(seat => seat !== seatNumber));
                }
            } else if (selectedSeats.includes(seatNumber)) {
                setSelectedSeats(selectedSeats.filter(seat => seat !== seatNumber));
            }
        } else {
            // For single trip, only allow selecting 1 seat
            if (selectedSeats.includes(seatNumber)) {
                setSelectedSeats([]);
            } else {
                setSelectedSeats([seatNumber]);
            }
        }
    };

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        // Kiểm tra xem có ghế nào trong selectedSeats đã bị đặt bởi người khác không
        const isAnySeatBooked = selectedSeats.some(seat => bookedSeats.includes(seat)
            || confirmedSeats.includes(seat));
        if (isAnySeatBooked) {
            alert("Một số ghế bạn chọn đã được đặt. Vui lòng chọn ghế khác.");
            return;
        }
        if (selectedSeats.length === 0 || (isTransfer && selectedSeats.length < 2)) {
            alert(`Vui lòng chọn ${isTransfer ? "2 ghế" : "1 ghế"}`);
            return;
        }

        try {
            const bookingData = {
                ...form,
                seatNumber: isTransfer ? selectedSeats.join(", ") : selectedSeats[0],
                tripId: trip?.id,
                secondTripId: isTransfer ? secondTrip?.id : null,
                price: isTransfer ? (trip.price + secondTrip.price) : trip.price
            };

            const response = await fetch("https://683ac9b843bb370a8673bd67.mockapi.io/api/BusRoutes/Ticket", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(bookingData),
            });
            if (response.ok) {
                // Thêm ghế đã đặt vào danh sách confirmedSeats
                setConfirmedSeats([...reservedSeats, ...selectedSeats]);
                alert("Đặt vé thành công!");
                // Reset selected seats sau khi đặt thành công
                setSelectedSeats([]);
            }
        } catch (error) {
            alert("Đặt vé thất bại. Vui lòng thử lại.");
        }
    };

    // Generate seat numbers from 01 to 28
    const seatNumbers = Array.from({ length: 28 }, (_, i) =>
        (i + 1).toString().padStart(2, '0')
    );
    if (isLoading) {
        return <div>Loading...</div>
    }
    return (
        <div className="booking-page">
            <div className="booking-container">
                <div className="left-panel">
                    <div className="seat-selection">
                        <h2>Chọn ghế</h2>
                        <div className="seat-legend">
                            <div className="legend-item">
                                <div className="seat-box booked"></div>
                                <span>Đã bán</span>
                            </div>
                            <div className="legend-item">
                                <div className="seat-box available"></div>
                                <span>Còn trống</span>
                            </div>
                            <div className="legend-item">
                                <div className="seat-box selected"></div>
                                <span>Đang chọn</span>
                            </div>
                        </div>

                        <div className="seat-grid">
                            {seatNumbers.map((seat, index) => {
                                const isBooked = reservedSeats.includes(seat);
                                const isSelected = selectedSeats.includes(seat);
                                let seatClass = "seat-box";
                                if (isBooked) {
                                    seatClass += " booked";
                                } else if (isSelected) {
                                    seatClass += " selected";
                                } else {
                                    seatClass += " available";
                                }

                                return (
                                    <div
                                        key={seat}
                                        className={seatClass}
                                        onClick={() => !isBooked && handleSeatClick(seat)}
                                        title={isBooked ? "Ghế đã đặt" : "Ghế trống"}
                                    >
                                        {seat}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                    <form className="ticket-form" onSubmit={handleSubmit}>
                        <h2>Thông tin khách hàng</h2>
                        <input
                            name="fullName"
                            placeholder="Họ tên"
                            value={form.fullName}
                            onChange={handleChange}
                            required
                        />
                        <input
                            name="phone"
                            placeholder="Số điện thoại"
                            value={form.phone}
                            onChange={handleChange}
                            required
                        />
                        <input
                            name="email"
                            placeholder="Email"
                            type="email"
                            value={form.email}
                            onChange={handleChange}
                        />

                        <button type="submit">Xác nhận đặt vé</button>
                    </form>
                </div>

                <div className="right-panel">
                    {trip && (
                        <div className="trip-info">
                            <h3>Thông tin chuyến xe</h3>
                            <div className="trip-detail">
                                <h4>Chuyến chính</h4>
                                <p><strong>Lộ trình:</strong> {trip.FromLocation} → {trip.EndLocation}</p>
                                <p><strong>Thời gian:</strong> {trip.timeStart} - {trip.timeEnd}</p>
                                <p><strong>Giá vé:</strong> {trip.price.toLocaleString()} VND</p>
                            </div>

                            {isTransfer && secondTrip && (
                                <div className="trip-detail">
                                    <h4>Chuyến trung chuyển</h4>
                                    <p><strong>Lộ trình:</strong> {secondTrip.FromLocation} → {secondTrip.EndLocation}</p>
                                    <p><strong>Thời gian:</strong> {secondTrip.timeStart} - {secondTrip.timeEnd}</p>
                                    <p><strong>Giá vé:</strong> {secondTrip.price.toLocaleString()} VND</p>
                                </div>
                            )}

                            <div className="total-price">
                                <h4>Tổng cộng:</h4>
                                <p>{isTransfer && secondTrip
                                    ? (trip.price + secondTrip.price).toLocaleString()
                                    : trip.price.toLocaleString()} VND</p>
                            </div>
                        </div>
                    )}


                </div>
            </div>
        </div>
    );
};

export default TicketBooking;