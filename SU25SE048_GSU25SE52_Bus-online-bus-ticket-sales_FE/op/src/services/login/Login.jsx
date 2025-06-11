import { useState } from "react";
import axios from "axios";
import { data, Link, useNavigate } from "react-router-dom";
import './Login.css';
import Header from "../../components/header/Header";
const LoginForm = () => {
    const [username, setUsername] = useState('');
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
            const checkUserResponse = await axios.get('https://68366847664e72d28e40a9cf.mockapi.io/api/SearchTickets/User');
            const match = checkUserResponse.data.find(user => user.username === username
                && user.password === password
            );
            if (match) {
                const response = {
                    data: {
                        success: true,
                        redirectTo: '/manageRoute'
                    }
                }
                if (response.data.success) {
                    setLoginStatus(true);
                    localStorage.setItem('user', JSON.stringify(response.data.user));
                    localStorage.setItem('token', response.data.token);
                    const redirectTo = response.data.redirectTo || '/manageRoute';
                    navigate(redirectTo);
                } else {
                    throw new Error('Sai tên đăng nhập hoặc mật khẩu');
                }
            } else {
                throw new Error('Sai tên đăng nhập hoặc mật khẩu');
            }
        } catch (error) {
            setErrorMessage(error.response?.data?.message || error.message || 'Đăng nhập thất bại');
        } finally {
            setIsLoading(false);
        }
    };
    return (
        <div className="login-page">
            <Header />
            <div className="login-content">
                <div className="login-container">
                    <h2>Đăng nhập</h2>
                    {loginStatus === true && (
                        <div className="success-message">
                            Đăng nhập thành công
                        </div>
                    )}
                    {(loginStatus === null || loginStatus === false) && (
                        <form onSubmit={handleLogin}>
                            <input type="text" placeholder="Tên đăng nhập hoặc số điện thoại"
                                value={username} onChange={(e) => setUsername(e.target.value)} required />
                            <input type="password" placeholder="Mật khẩu" value={password}
                                onChange={(e) => setPassword(e.target.value)} required />
                            <button type="submit">
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
    )
}
export default LoginForm;