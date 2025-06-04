import '../about/About.css';
import Header from '../header/Header';
function About() {
    return (
        <div className='page-container'>
            <Header />
            <div className="about">
                <main className="main-content">
                    <h1>Đặt vé xe buýt <span className="highlight">online</span></h1>
                    <p>Nhanh chóng, an toàn và tiện lợi để đặt vé xe buýt. Du lịch mọi nơi chỉ với vài cú nhấp chuột.</p>
                    <div className="buttons">
                        <button className="btn book-now">Book Now</button>
                        <button className="btn learn-more">Learn More</button>
                    </div>
                </main>
            </div>
        </div>
    )
}
export default About;