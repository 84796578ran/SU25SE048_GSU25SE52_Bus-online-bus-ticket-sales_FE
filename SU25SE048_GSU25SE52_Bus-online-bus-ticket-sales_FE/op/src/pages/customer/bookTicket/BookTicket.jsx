import React, { useState } from "react";
import "../bookTicket/BookTicket.css";

const TicketBooking = () => {
    const [form, setForm] = useState({
        seatNumber: "",
        fullName: "",
        phone: "",
        email: "",
        pickUp: "",
        dropOff: "",
    });

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch("https://683ac9b843bb370a8673bd67.mockapi.io/api/BusRoutes/Ticket", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });
            const result = await response.json();
            alert("Đặt vé thành công: ");
        } catch (error) {
            alert("Đặt vé thất bại. Vui lòng thử lại.");
        }
    };

    return (
        <form className="ticket-form" onSubmit={handleSubmit}>
            <h2>Đặt vé xe</h2>
            <input name="seatNumber" placeholder="Số ghế" onChange={handleChange} />
            <input name="fullName" placeholder="Họ tên" onChange={handleChange} />
            <input name="phone" placeholder="Số điện thoại" onChange={handleChange} />
            <input name="email" placeholder="Email" onChange={handleChange} />
            <input name="pickUp" placeholder="Điểm đón" onChange={handleChange} />
            <input name="dropOff" placeholder="Điểm trả" onChange={handleChange} />
            <button type="submit">Đặt vé</button>
        </form>
    );
};

export default TicketBooking;
