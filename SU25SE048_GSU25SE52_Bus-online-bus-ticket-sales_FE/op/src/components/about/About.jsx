import { Link } from 'react-router-dom';
import '../about/About.css';
import Footer from '../footer/Footer';
import Header from '../header/Header';

function About() {
    return (
        <div className='page-container'>
            <Header />
            <div className='main-content'>
                <div className="about-section">
                    <div className="about-content">
                        <div className="about-text">
                            <h2>Chào mừng đến với <span className="brand">BusTicket</span></h2>
                            <p className="slogan">Di chuyển thông minh - Kết nối mọi nơi</p>

                            <div className="features">
                                <div className="feature-item">
                                    <div className="feature-icon">🚌</div>
                                    <h3>Đặt vé dễ dàng</h3>
                                    <p>Chỉ vài thao tác đơn giản để sở hữu vé xe nhanh chóng</p>
                                </div>

                                <div className="feature-item">
                                    <div className="feature-icon">💰</div>
                                    <h3>Giá cả hợp lý</h3>
                                    <p>Nhiều ưu đãi hấp dẫn và lộ trình đa dạng</p>
                                </div>

                                <div className="feature-item">
                                    <div className="feature-icon">🛡️</div>
                                    <h3>An toàn tuyệt đối</h3>
                                    <p>Cam kết chất lượng dịch vụ và an ninh hành trình</p>
                                </div>
                            </div>

                            <Link to='/' className="cta-button">Đặt vé ngay</Link>
                        </div>
                    </div>
                </div>
                <div className='about-footer'>
                    <Footer
                    />
                </div>
            </div>
        </div>
    )
}
export default About;