import { Link } from 'react-router-dom';
import '../contact/Contact.css';
import Header from '../header/Header';
import { FaMapMarkerAlt, FaPhoneAlt, FaEnvelope } from 'react-icons/fa';
import Footer from '../footer/Footer';

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
                <Footer />
            </div>
        </div>
    )
}
export default Contact;