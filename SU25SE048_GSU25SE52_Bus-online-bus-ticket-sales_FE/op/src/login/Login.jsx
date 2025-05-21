import { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import '../login/Login.css';
const LoginForm = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const handleLogin = async () => {
        try {
            const response = await axios.post('', {
                username,
                password
            });
            alert('Login success');
        } catch (error) {
            alert('Login failed');
        }
    };
    return (
        <div className="login-container">
            <h2>Đăng nhập</h2>
            <input type="text" placeholder="Tên đăng nhập hoặc số điện thoại"
                value={username} onChange={(e) => setUsername(e.target.value)} />
            <input type="password" placeholder="Mật khẩu" value={password}
                onChange={(e) => setPassword(e.target.value)} />
            <button onClick={handleLogin}>Đăng nhập</button>
            <button className="google-login">
                <img src="channels4_profile-removebg-preview.png"
                    className="google-logo"></img>
                Đăng nhập bằng Gmail
            </button>
            <Link to='/forgotPass'>Quên mật khẩu?</Link>
        </div>
    )
}
export default LoginForm;