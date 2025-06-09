import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import '../login/Login.css';
const LoginForm = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();
    const [errorMessage, setErrorMessage] = useState('');
    const [loginStatus, setLoginStatus] = useState(null);
    const handleLogin = async () => {
        try {
            // k được dùng get để lấy username và password  vì sẽ bị lộ
            const response = await axios.get('https://68366847664e72d28e40a9cf.mockapi.io/api/SearchTickets/User', {
                username,
                password
            });
            const user = response.data.find(
                user => user.username === username && user.password === password
            );
            if (user) {
                setLoginStatus(true);
                setErrorMessage('');
                localStorage.setItem('user', JSON.stringify(user));
                navigate('/home');
            } else {
                throw new Error('Sai tên đăng nhập hoặc mật khẩu');
            }
        } catch (error) {
            setLoginStatus(false);
            setErrorMessage(error.message);
        }
    };
    return (
        <div className="login-container">
            <h2>Đăng nhập</h2>
            {loginStatus === true && (
                <div className="success-message">
                    Đăng nhập thành công
                </div>
            )}
            {(loginStatus === null || loginStatus === false) && (
                <>
                    <input type="text" placeholder="Tên đăng nhập hoặc số điện thoại"
                        value={username} onChange={(e) => setUsername(e.target.value)} />
                    <input type="password" placeholder="Mật khẩu" value={password}
                        onChange={(e) => setPassword(e.target.value)} />
                    <button onClick={handleLogin}>Đăng nhập</button>
                    {loginStatus === false && errorMessage && (
                        <p className="error-message">{errorMessage}</p>
                    )}
                    <button className="google-login" onClick={() =>
                        window.location.href = '/loginGoogle'
                    }>
                        <img src="../assets/GoogleLogo.png"
                            className="google-logo" alt="Google Logo"></img>
                        Đăng nhập bằng Gmail
                    </button>
                    <Link to='/forgotPass'>Quên mật khẩu?</Link>
                </>
            )}
        </div>
    )
}
export default LoginForm;