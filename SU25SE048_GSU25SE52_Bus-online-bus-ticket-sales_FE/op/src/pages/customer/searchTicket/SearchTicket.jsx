import { useState } from 'react';
import '../searchTicket/SearchTicket.css';
import Header from '../../../components/header/Header';
import PromotionBanner from './PromotionBanner';
import SearchForm from './SearchForm';
import PopularRoutes from './PopularRoutes';
import Footer from '../../../components/footer/Footer';
import { useNavigate } from 'react-router-dom';
const SearchTicket = () => {
    const [searchResults, setSearchResults] = useState(null);
    const navigate = useNavigate();
    const [selectedTrip, setSelectedTrips] = useState([]);
    const handleBookTicket = (trips) => {
        const tripsArray = Array.isArray(trips) ? trips : [trips];
        setSelectedTrips(trips);
        navigate('/bookTicket', {
            state: {
                trips: tripsArray,
            }
        })
    }
    return (
        <div className='home-page-container' style={{ overflowY: 'auto' }}>
            <Header />
            <div className="home-page">
                <main>
                    <section className="hero-section">
                        <div className="hero-content">
                            <h1>Đặt vé xe khách trực tuyến</h1>
                            <SearchForm onSearch={setSearchResults} />
                        </div>
                    </section>
                    {searchResults ? (
                        <section className="search-results">
                            <h2>Kết quả tìm kiếm</h2>
                            {/* Hiển thị kết quả tìm kiếm ở đây */}
                            {searchResults.loading ? (
                                <p>Đang tìm kiếm...</p>
                            ) : searchResults.error ? (
                                <p>
                                    Không tìm thấy chuyến xe
                                </p>
                            ) : (
                                <div className="trips-list">
                                    {searchResults.data?.searchTrips?.length > 0 ? (
                                        searchResults.data.searchTrips.map(trip => (
                                            <div key={trip.tripId} className="trip-card">
                                                <h3>
                                                    {trip.fromLocation} → {trip.endLocation}
                                                </h3>
                                                <p>
                                                    Thời gian bắt đầu: {new Date(trip.timeStart).toLocaleString()}
                                                </p>
                                                <p>
                                                    Thời gian kết thúc: {new Date(trip.timeEnd).toLocaleString()}
                                                </p>
                                                <p>
                                                    Giá vé: {trip.price.toLocaleString()} VND
                                                </p>
                                                <p>
                                                    Nhà xe: {trip.busName}
                                                </p>
                                                <button onClick={() => handleBookTicket(trip)} className='book-button'>
                                                    Đặt vé
                                                </button>
                                            </div>
                                        ))
                                    ) : (
                                        <p>Khong tim thay chuyen xe phu hop</p>
                                    )}
                                </div>
                            )}
                        </section>
                    ) : (
                        <>
                            <PromotionBanner />
                            <PopularRoutes />
                        </>
                    )}
                </main>
            </div>
            <div className='search-ticket-footer'>
                <Footer />
            </div>
        </div>
    )
}
export default SearchTicket;