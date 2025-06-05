import { Link } from 'react-router-dom';
import '../contact/Contact.css';
import Header from '../header/Header';
import { FaMapMarkerAlt, FaPhoneAlt, FaEnvelope, FaPaperPlane, FaFacebook, FaTwitter, FaInstagram, FaYoutube } from 'react-icons/fa';

const Contact = () => {
    return (
        <div className='contact-layout'>
            <Header />
            <div className="contact-content">
                <div className="contact-hero">
                    <h1>Liên Hệ Với Chúng Tôi</h1>
                    <p>Chúng tôi luôn sẵn sàng hỗ trợ và giải đáp mọi thắc mắc của bạn</p>
                </div>

                <div className="contact-container">
                    <div className="contact-info">
                        <div className="info-card">
                            <div className="info-icon">
                                <FaMapMarkerAlt />
                            </div>
                            <h3>Địa Chỉ</h3>
                            <p>123 Đường ABC, Quận 1, TP.HCM</p>
                        </div>

                        <div className="info-card">
                            <div className="info-icon">
                                <FaPhoneAlt />
                            </div>
                            <h3>Điện Thoại</h3>
                            <p>0837 942 153</p>
                        </div>

                        <div className="info-card">
                            <div className="info-icon">
                                <FaEnvelope />
                            </div>
                            <h3>Email</h3>
                            <p>tienich58@gmail.com</p>
                        </div>
                    </div>
                </div>

                <footer className="contact-footer">
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
            </div>
        </div>
    )
}
export default Contact;