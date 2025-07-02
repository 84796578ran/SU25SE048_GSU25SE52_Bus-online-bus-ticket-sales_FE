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
    // Hàm kiểm tra có kết quả tìm kiếm hay không
    const hasSearchResults = (data) => {
        return (data?.directTrips && data.directTrips.length > 0) ||
            (data?.transferTrips && data.transferTrips.length > 0) ||
            (data?.tripleTrips && data.tripleTrips.length > 0);
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
                            ) : !hasSearchResults(searchResults.data) ? (
                                <p>Không tìm thấy chuyến xe phù hợp</p>
                            ) : (
                                <div className="trips-list">
                                    {/* Hiển thị direct trips */}
                                    {searchResults.data?.directTrips?.map(trip => (
                                        <div key={trip.tripId} className="trip-card">
                                            <h3>{trip.fromLocation} → {trip.endLocation}</h3>
                                            <p>Thời gian bắt đầu: {new Date(trip.timeStart).toLocaleString()}</p>
                                            <p>Thời gian kết thúc: {new Date(trip.timeEnd).toLocaleString()}</p>
                                            <p>Giá vé: {trip.price.toLocaleString()} VND</p>
                                            <p>Nhà xe: {trip.busName}</p>
                                            <button onClick={() => handleBookTicket(trip)} className='book-button'>
                                                Đặt vé
                                            </button>
                                        </div>
                                    ))}
                                    {/* Hiển thị transfer trips */}
                                    {searchResults.data?.transferTrips?.map((trip, index) => (
                                        <div key={`transfer-${index}`} className='trip-card'>
                                            <h3>{trip.firstTrip.fromLocation} → {trip.secondTrip.endLocation}</h3>
                                            <p>Thời gian bắt đầu: {new Date(trip.firstTrip.timeStart).toLocaleString()}</p>
                                            <p>Thời gian kết thúc: {new Date(trip.secondTrip.timeEnd).toLocaleString()}</p>
                                            <p>Giá vé: {(trip.firstTrip.price + trip.secondTrip.price).toLocaleString()} VND</p>
                                            <p>Chuyến 1: {trip.firstTrip.busName} ({trip.firstTrip.fromLocation} → {trip.firstTrip.endLocation})</p>
                                            <p>Chuyến 2: {trip.secondTrip.busName} ({trip.secondTrip.fromLocation} → {trip.secondTrip.endLocation})</p>
                                            <button onClick={() => handleBookTicket([trip.firstTrip, trip.secondTrip])} className='book-button'>
                                                Đặt vé
                                            </button>
                                        </div>
                                    ))}

                                    {searchResults.data?.tripleTrips?.map((trip) => (
                                        <div key={`${trip.firstTrip.tripId}-${trip.secondTrip.tripId}-${trip.thirdTrip.tripId}`} className="trip-card">
                                            <h3>{trip.firstTrip.fromLocation} → {trip.thirdTrip.endLocation}</h3>
                                            <p>Thời gian bắt đầu: {new Date(trip.firstTrip.timeStart).toLocaleString()}</p>
                                            <p>Thời gian kết thúc: {new Date(trip.thirdTrip.timeEnd).toLocaleString()}</p>
                                            <p>Giá vé: {(trip.firstTrip.price + trip.secondTrip.price + trip.thirdTrip.price).toLocaleString()} VND</p>
                                            <p>Nhà xe: {[trip.firstTrip.busName, trip.secondTrip.busName, trip.thirdTrip.busName].join(' → ')}</p>
                                            <button onClick={() => handleBookTicket([trip.firstTrip, trip.secondTrip, trip.thirdTrip])} className='book-button'>
                                                Đặt vé
                                            </button>
                                        </div>
                                    ))}

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