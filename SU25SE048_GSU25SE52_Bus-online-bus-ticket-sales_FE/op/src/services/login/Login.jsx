import { useState } from "react";
import axios from "axios";
import { data, Link, useNavigate } from "react-router-dom";
import '../login/Login.css';
const LoginForm = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();
    const [errorMessage, setErrorMessage] = useState('');
    const [loginStatus, setLoginStatus] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setErrorMessage('');
        try {
            const response = await axios.post('https://localhost:7197/api/SystemUser/login', {
                email: email,
                password: password
            }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            if (response.data.token) {
                setLoginStatus(true);
                localStorage.setItem('user', JSON.stringify(response.data.user));
                localStorage.setItem('token', response.data.token);
                navigate('/manage-route', { replace: true });
            } else {
                throw new Error('Sai tên đăng nhập hoặc mật khẩu');
            }
        } catch (error) {
            console.error('Login error:', error);
            const backendError = error.response?.data?.message
                || error.response?.data?.title
                || error.message;
            setErrorMessage(backendError || 'Đăng nhập thất bại');
            setLoginStatus(false);
        } finally {
            setIsLoading(false);
        }
    };
    return (
        <div className="login-page">
            <div className="screen-split-container">
                <div className="screen-left">
                    <img src="/Logo.png" alt="Logo" className="login-logo" />
                </div>
                <div className="screen-right">
                    <div className="login-container">
                        <h2>Đăng nhập</h2>
                        {loginStatus === true && (
                            <div className="success-message">
                                Đăng nhập thành công
                            </div>
                        )}
                        {(loginStatus === null || loginStatus === false) && (
                            <form onSubmit={handleLogin}>
                                <input type="text" placeholder="Email"
                                    value={email} onChange={(e) => setEmail(e.target.value)} required />
                                <input type="password" placeholder="Mật khẩu" value={password}
                                    onChange={(e) => setPassword(e.target.value)} required />
                                <button type="submit" disabled={isLoading}>
                                    {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                                </button>
                                {loginStatus === false && errorMessage && (
                                    <p className="error-message">{errorMessage}</p>
                                )}
                                <button className="google-login" onClick={() =>
                                    window.location.href = '/loginGoogle'
                                }>
                                    <img src="GoogleLogo.png"
                                        className="google-logo"></img>
                                    Đăng nhập bằng Gmail
                                </button>
                                <Link to='/forgotPass'>Quên mật khẩu?</Link>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
export default LoginForm;