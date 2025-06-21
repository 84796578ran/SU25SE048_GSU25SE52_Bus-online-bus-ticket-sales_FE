import '../header/Header.css';
import { Link, useLocation } from 'react-router-dom';
import { FaHome, FaInfoCircle, FaConciergeBell, FaSignInAlt, FaUserPlus, FaEnvelope } from 'react-icons/fa';

const Header = () => {
    const location = useLocation();

    // Kiểm tra active route bao gồm cả các sub-routes
    const isActive = (path) => {
        return location.pathname.startsWith(path);
    };

    return (
        <header className="header">
            <div className="logo-container">
                <Link to="/">
                    <img
                        src='Logo.png'
                        className='logo-img'
                        alt="Website Logo"
                    />
                </Link>
            </div>
            <nav className="nav-menu">
                <ul className='nav-list'>
                    <li className='nav-item'>
                        <Link
                            to="/"
                            className={`nav-link ${isActive('/') ? 'active' : ''}`}
                        >
                            <FaHome />
                            <span>Trang chủ</span>
                        </Link>
                    </li>
                    <li className='nav-item'>
                        <Link
                            to="/services"
                            className={`nav-link ${isActive('/services') ? 'active' : ''}`}
                        >
                            <FaConciergeBell />
                            <span>Dịch vụ</span>
                        </Link>
                    </li>
                    <li className='nav-item'>
                        <Link
                            to="/contact"
                            className={`nav-link ${isActive('/contact') ? 'active' : ''}`}
                        >
                            <FaEnvelope />
                            <span>Liên hệ</span>
                        </Link>
                    </li>
                    <li className='nav-item'>
                        <Link
                            to="/about"
                            className={`nav-link ${isActive('/about') ? 'active' : ''}`}
                        >
                            <FaInfoCircle />
                            <span>Giới thiệu</span>
                        </Link>
                    </li>
                </ul>
            </nav>

            <div className="auth-section">
                <Link to="/register" className='auth-link register'>
                    <FaUserPlus />
                    <span style={{ marginLeft: '8px' }}>Đăng ký</span>
                </Link>
                <Link to="/login" className='auth-link login'>
                    <FaSignInAlt />
                    <span style={{ marginLeft: '8px' }}>Đăng nhập</span>
                </Link>
            </div>
        </header>
    );
};
export default Header;