import { FaEnvelope, FaFacebook, FaInstagram, FaMapMarkerAlt, FaPhoneAlt, FaTwitter, FaYoutube } from 'react-icons/fa';
import '../footer/Footer.css';
import { Link } from 'react-router-dom';
const Footer = () => {
    return (
        <footer className="contact-footer" style={{
            marginLeft: '40px', width: '100%',
            marginTop: '150px'
        }}>
            <div className="footer-container">
                <div className="footer-brand">
                    <h3 className="footer-logo">TIỆN ÍCH</h3>
                    <p className="footer-slogan">Nền tảng bán vé xe trực tuyến hàng đầu</p>
                    <div className="footer-social">
                        <a href="#" className="social-icon"><FaFacebook /></a>
                        <a href="#" className="social-icon"><FaTwitter /></a>
                        <a href="#" className="social-icon"><FaInstagram /></a>
                        <a href="#" className="social-icon"><FaYoutube /></a>
                    </div>
                </div>

                <div className="footer-contact">
                    <h4 className="footer-title">Liên hệ</h4>
                    <ul className="footer-list">
                        <li><FaMapMarkerAlt /> 123 Đường ABC, Quận 1, TP.HCM</li>
                        <li><FaPhoneAlt /> 0837 942 153</li>
                        <li><FaEnvelope /> tienich58@gmail.com</li>
                    </ul>
                </div>

                <div className="footer-links">
                    <h4 className="footer-title">Liên kết nhanh</h4>
                    <ul className="footer-list">
                        <li><Link to="/home">Trang chủ</Link></li>
                        <li><Link to="/about">Giới thiệu</Link></li>
                        <li><Link to="/services">Dịch vụ</Link></li>
                        <li><Link to="/contact">Liên hệ</Link></li>
                    </ul>
                </div>
            </div>

            <div className="footer-bottom">
                <p className="copyright">© 2023 <strong>Tiện Ích</strong>. All rights reserved.</p>
            </div>
        </footer>
    )
};
export default Footer;