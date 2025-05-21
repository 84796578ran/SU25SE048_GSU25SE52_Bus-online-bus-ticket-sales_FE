import '../header/Header.css';
import { Link } from 'react-router-dom';

const Header = () => {
    return (
        <header className="header">
            <div className="logo">
                <img src='z6610397187736_0129b5400c3fb8991bfc9acb047eea2a-removebg-preview.png' />
            </div>
            <nav className="nav">
                <ul>
                    <li><Link to="/home">Trang chủ</Link></li>
                    <li><Link to="/about">Giới thiệu</Link></li>
                    <li><Link to="/services">Dịch vụ</Link></li>
                    <li><Link to="/contact">Liên hệ</Link></li>
                </ul>
            </nav>
            <div className="auth">
                <Link to="/register">Đăng ký</Link>
                <Link to="/">Đăng nhập</Link>
            </div>
        </header>
    );
};
export default Header;
