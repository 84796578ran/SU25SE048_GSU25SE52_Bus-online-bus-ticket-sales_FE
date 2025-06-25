import { useEffect, useState } from "react";
import "../bookTicket/BookTicket.css";
import { useLocation } from "react-router-dom";

const TicketBooking = () => {
    const location = useLocation();
    const { trip, isTransfer = false, secondTrip = null } = location.state || {};
    const [selectedSeats, setSelectedSeats] = useState({
        firstTrip: null,
        secondTrip: null
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
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
    const handleSeatClick = (seatNumber, tripType = 'firstTrip') => {
        if (reservedSeats.includes(seatNumber)) {
            return;
        }
        setSelectedSeats(prev => {
            if (prev[tripType] === seatNumber) {
                return {
                    ...prev,
                    [tripType]: null
                }
            }
            // Nếu ghế đã được chọn cho chuyến khác thì không làm gì
            const otherTripType = tripType === 'firstTrip' ? 'secondTrip' : 'firstTrip';
            // Nếu ghế đã được chọn cho chuyến khác thì không làm gì
            if (prev[otherTripType] === seatNumber) {
                return prev;
            }
            // Chọn ghế mới
            return { ...prev, [tripType]: seatNumber };
        });

    };

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        // Kiểm tra thông tin form
        if (!form.fullName || !form.phone) {
            alert("Vui lòng điền đầy đủ thông tin khách hàng");
            return;
        }
        // Kiểm tra ghế đã chọn
        if (!selectedSeats.firstTrip || (isTransfer && !selectedSeats.secondTrip)) {
            alert(`Vui lòng chọn ${isTransfer ? "ghế cho cả 2 chuyến" : "ghế"}`);
            return;
        }
        // Kiểm tra ghế đã bị đặt
        const seatsToCheck = isTransfer
            ? [selectedSeats.firstTrip, selectedSeats.secondTrip]
            : [selectedSeats.firstTrip];
        const isAnySeatBooked = seatsToCheck.some(seat => reservedSeats.includes(seat)
            || confirmedSeats.includes(seat));
        if (isAnySeatBooked) {
            alert("Một số ghế bạn chọn đã được đặt. Vui lòng chọn ghế khác.");
            return;
        }
        try {
            const bookingData = {
                ...form,
                seatNumber: isTransfer
                    ? `Chuyến 1: ${selectedSeats.firstTrip}, Chuyến 2: ${selectedSeats.secondTrip}`
                    : selectedSeats.firstTrip,
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
                setConfirmedSeats([...confirmedSeats, ...seatsToCheck]);
                alert("Đặt vé thành công!");
                // Reset selected seats sau khi đặt thành công
                setSelectedSeats({
                    firstTrip: null,
                    secondTrip: null
                });
            }
        } catch (error) {
            alert("Đặt vé thất bại. Vui lòng thử lại.");
        }
        finally {
            setIsSubmitting(false);
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
                            {isTransfer && (
                                <div className="legend-item">
                                    <div className="seat-box selected-second"></div>
                                    <span>Chuyến trung chuyển</span>
                                </div>
                            )}
                        </div>
                        <div className="trip-selection">
                            <div className="seat-grid">
                                {seatNumbers.map((seat) => {
                                    const isBooked = reservedSeats.includes(seat);
                                    const isSelectedFirst = selectedSeats.firstTrip === seat;
                                    const isSelectedSecond = selectedSeats.secondTrip === seat;
                                    let seatClass = "seat-box";
                                    if (isBooked) {
                                        seatClass += " booked";
                                    } else if (isSelectedFirst) {
                                        seatClass += " selected-first";
                                    } else if (isSelectedSecond) {
                                        seatClass += " selected-second";
                                    }
                                    else {
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
                        {/* Chọn ghế cho chuyến trung chuyển (nếu có)*/}
                        {isTransfer && secondTrip && (
                            <>
                                <div className="seat-grid">
                                    {seatNumbers.map((seat) => {
                                        const isBooked = reservedSeats.includes(seat);
                                        const isSelectedSecond = selectedSeats.secondTrip === seat;
                                        const isSelectedFirst = selectedSeats.firstTrip === seat;
                                        let seatClass = "seat-box";
                                        if (isBooked) {
                                            seatClass += " booked";
                                        } else if (isSelectedSecond) {
                                            seatClass += " selected-second";
                                        } else if (isSelectedFirst) {
                                            seatClass += " selected-first";
                                        } else {
                                            seatClass += " available";
                                        }
                                        return (
                                            <div
                                                key={`second-${seat}`}
                                                className={seatClass}
                                                onClick={() => !isBooked && handleSeatClick(seat, 'secondTrip')}
                                                title={isBooked ? "Ghế đã đặt" : "Ghế trống"}
                                            >
                                                {seat}
                                            </div>
                                        );
                                    })}
                                </div>
                            </>
                        )}
                    </div>
                    <form className="ticket-form" onSubmit={handleSubmit}>
                        <h2>Thông tin khách hàng</h2>
                        <label>Họ và tên</label>
                        <input
                            name="fullName"
                            placeholder="Họ tên"
                            value={form.fullName}
                            onChange={handleChange}
                            required
                        />
                        <label>Số điện thoại</label>
                        <input
                            name="phone"
                            placeholder="Số điện thoại"
                            value={form.phone}
                            onChange={handleChange}
                            required
                        />
                        <label>Email</label>
                        <input
                            name="email"
                            placeholder="Email"
                            type="email"
                            value={form.email}
                            onChange={handleChange}
                        />
                        <label>Điểm đón</label>
                        <input
                            name="pickUp"
                            placeholder="Điểm đón"
                            type="text"
                            value={form.pickUp}
                            onChange={handleChange}
                        />
                        <label>Điểm trả</label>
                        <input
                            name="dropOff"
                            placeholder="Điểm trả"
                            type="text"
                            value={form.dropOff}
                            onChange={handleChange}
                        />
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
            <footer className="booking-footer">
                <button type="submit" onClick={handleSubmit}>Đặt vé</button>
            </footer>
        </div>
    );
};
export default TicketBooking;