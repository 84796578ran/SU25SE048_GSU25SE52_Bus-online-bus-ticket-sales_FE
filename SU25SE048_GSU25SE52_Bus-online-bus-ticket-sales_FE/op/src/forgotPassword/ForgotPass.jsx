import { useState } from "react";
import axios from "axios";
import '../forgotPassword/ForgotPass.css';
const ForgotPassword = () => {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post("https://api.example.com/forgot-password", { email });
            setMessage(response.data.message);
        } catch (error) {
            setMessage("Có lỗi xảy ra. Vui lòng thử lại!");
        }
    };
    return (
        <div className="forgot-password-container">
            <h2>Quên Mật Khẩu</h2>
            <form onSubmit={handleSubmit}>
                <input
                    type="email"
                    placeholder="Nhập email của bạn"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <button type="submit">Gửi yêu cầu</button>
            </form>
            {message && <p>{message}</p>}
        </div>
    );
};
export default ForgotPassword;
