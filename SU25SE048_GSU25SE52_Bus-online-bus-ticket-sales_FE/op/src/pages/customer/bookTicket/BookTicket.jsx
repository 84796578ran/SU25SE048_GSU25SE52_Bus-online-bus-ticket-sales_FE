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
    const [isLoading, setIsLoading] = useState(false);
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
    const [transferTrips, setTransferTrips] = useState([]);
    const handleSeatClick = (seatNumber, tripType = 'firstTrip') => {
        if (reservedSeats.includes(seatNumber)) {
            return;
        }
        setSelectedSeats(prev => ({
            ...prev,
            [tripType]: prev[tripType] === seatNumber ? null : seatNumber
        }));

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
            setIsSubmitting(false);
            return;
        }

        // Kiểm tra ghế đã chọn
        if (!selectedSeats.firstTrip || (isTransfer && !selectedSeats.secondTrip)) {
            alert(`Vui lòng chọn ${isTransfer ? "ghế cho cả 2 chuyến" : "ghế"}`);
            setIsSubmitting(false);
            return;
        }
        // Kiểm tra ghế đã bị đặt
        const seatsToCheck = [selectedSeats.firstTrip];
        if (isTransfer) seatsToCheck.push(selectedSeats.secondTrip);

        const isAnySeatBooked = seatsToCheck.some(seat => reservedSeats.includes(seat)
            || confirmedSeats.includes(seat));
        if (isAnySeatBooked) {
            alert("Một số ghế bạn chọn đã được đặt. Vui lòng chọn ghế khác.");
            setIsSubmitting(false);
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
                price: isTransfer ? (trip.price + secondTrip.price) : trip.price,
                bookedSeats: isTransfer
                    ? [selectedSeats.firstTrip, selectedSeats.secondTrip]
                    : [selectedSeats.firstTrip]
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
                setReservedSeats(prev => [
                    ...prev,
                    ...bookingData.bookedSeats
                ]);

            }
        } catch (error) {
            alert("Đặt vé thất bại. Vui lòng thử lại.");
        }
        finally {
            setIsSubmitting(false);
        }
    };
    const lowerDeckSeats = [
        ['01', '02', '03', '04'],
        ['05', '06', '07', '08'],
        ['09', '10', '11', '12'],
        ['13', '14', '15', '16']
    ];
    const upperDeckSeats = Array.from({ length: 12 }, (_, i) =>
        (i + 17).toString().padStart(2, '0'));
    if (isLoading) {
        return <div>Loading...</div>
    }
    return (
        <div className="booking-page">
            <div className="booking-container">
                <div className="left-panel">
                    {trip && (
                        <div className="trip-info">
                            <h3>Thông tin chuyến xe</h3>
                            <div className="trip-detail">
                                <h4>Chuyến chính</h4>
                                <p><strong>Lộ trình:</strong> {trip.FromLocation} → {trip.EndLocation}</p>
                                <p><strong>Thời gian:</strong> {new Date(trip.timeStart).toLocaleString()} - {new Date(trip.timeEnd).toLocaleString()}</p>
                                <p><strong>Giá vé:</strong> {trip.price.toLocaleString()} VND</p>
                            </div>

                            {/* Các chuyến trung chuyển */}
                            {isTransfer && transferTrips.map((transfer, index) => (
                                <div key={`transfer-${index}`} className="trip-detail">
                                    <h4>Chuyến trung chuyển {index + 1}</h4>
                                    <p><strong>Lộ trình:</strong> {transfer.fromLocation} → {transfer.endLocation}</p>
                                    <p><strong>Thời gian:</strong> {transfer.timeStart} - {transfer.timeEnd}</p>
                                    <p><strong>Giá vé:</strong> {transfer.price.toLocaleString()} VND</p>
                                </div>
                            ))}

                            <div className="total-price">
                                <h4>Tổng cộng:</h4>
                                <p>
                                    {isTransfer
                                        ? (trip.price + transferTrips.reduce((sum, t) => sum + t.price, 0)).toLocaleString()
                                        : trip.price.toLocaleString()
                                    } VND
                                </p>
                            </div>
                        </div>
                    )}

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
                            <div className="seat-grid lower-deck">
                                <h3>Tầng dưới</h3>
                                {lowerDeckSeats.map((row, rowIndex) => (
                                    <div key={`row-${rowIndex}`} className="seat-row" >
                                        {row.map((seat) => {
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
                                            } else {
                                                seatClass += " available";
                                            }
                                            return (
                                                <div
                                                    key={seat}
                                                    className={seatClass}
                                                    onClick={() => !isBooked && handleSeatClick(seat, 'firstType')}
                                                    title={isBooked ? "Ghế đã đặt" : "Ghế trống"}
                                                >
                                                    {seat}
                                                </div>
                                            );
                                        })}
                                    </div>
                                ))}
                            </div>
                            <h3>Tầng trên</h3>
                            <div className="seat-grid upper-deck">
                                {[0, 1, 2].map((rowIndex) => (
                                    <div key={`upper-row-${rowIndex}`} className="seat-row">
                                        {upperDeckSeats.slice(rowIndex * 4, (rowIndex + 1) * 4).map((seat) => {
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
                                ))}
                            </div>
                        </div>
                        {/* Chọn ghế cho chuyến trung chuyển (nếu có)*/}
                        {isTransfer && secondTrip && (
                            <>
                                <h3>Chuyến trung chuyển - Tầng dưới</h3>
                                <div className="seat-grid lower-deck">
                                    {lowerDeckSeats.map((row, rowIndex) => (
                                        <div key={`second-row-${rowIndex}`} style={{ display: 'flex', justifyContent: 'center' }}>
                                            {row.map((seat) => {
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
                                    ))}
                                </div>
                                <h3>Chuyến trung chuyển - Tầng trên</h3>
                                <div className="seat-grid upper-deck">
                                    {upperDeckSeats.map((seat) => {
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
                </div>
            </div>
            <footer className="booking-footer">
                <button type="submit" onClick={handleSubmit}>Đặt vé</button>
            </footer>
        </div>
    );
};
export default TicketBooking;