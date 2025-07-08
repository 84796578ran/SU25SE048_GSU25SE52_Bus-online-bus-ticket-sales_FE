// SearchResultsPage.js
import { useLocation, useNavigate } from 'react-router-dom';
import Footer from '../../../components/footer/Footer';
import Header from '../../../components/header/Header';
import '../searchTrip/SearchResultsPage.css';
const SearchResultsPage = () => {
    const location = useLocation();
    const { searchResults, error } = location.state || {};
    const navigate = useNavigate();
    const hasSearchResults = (data) => {
        return (data?.directTrips?.length > 0) ||
            (data?.transferTrips?.length > 0) ||
            (data?.tripleTrips?.length > 0);
    }
    const formatTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        })
    }
    const handleBookTicket = (trips) => {
        const tripsArray = Array.isArray(trips) ? trips : [trips];
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
                    <section className="search-results">
                        <h2>Kết quả tìm kiếm</h2>
                        {error ? (
                            <p className='error-message'>
                                Lỗi: {error}
                            </p>
                        ) : !searchResults ? (
                            <p>Vui lòng thực hiện tìm kiếm</p>
                        ) : !hasSearchResults(searchResults) ? (
                            <p>Không tìm thấy chuyến xe phù hợp</p>
                        ) : (
                            <div className="trips-list">
                                {/* Copy phần hiển thị kết quả từ SearchTrip vào đây */}
                                {searchResults?.directTrips?.map(trip => (
                                    <div key={trip.tripId} className="trip-card">
                                        <h3>{trip.fromLocation} → {trip.endLocation}</h3>
                                        <p>Thời gian bắt đầu: {formatTime(trip.timeStart)}</p>
                                        <p>Thời gian kết thúc: {formatTime(trip.timeEnd)}</p>
                                        <p>Giá vé: {trip.price.toLocaleString()} VND</p>
                                        <p>Nhà xe: {trip.busName}</p>
                                        <button onClick={() => handleBookTicket(trip)} className='book-button'>
                                            Đặt vé
                                        </button>
                                    </div>
                                ))}
                                {/* Thêm các phần transferTrips và tripleTrips tương tự */}
                                {/* Hiển thị transfer trips */}
                                {searchResults?.transferTrips?.map((trip, index) => (
                                    <div key={`transfer-${index}`} className='trip-card'>
                                        <h3>{trip.firstTrip.fromLocation} → {trip.secondTrip.endLocation}</h3>
                                        <p>Thời gian bắt đầu: {formatTime(trip.firstTrip.timeStart)}</p>
                                        <p>Thời gian kết thúc: {formatTime(trip.secondTrip.timeEnd)}</p>
                                        <p>Giá vé: {(trip.firstTrip.price + trip.secondTrip.price).toLocaleString()} VND</p>
                                        <p>Chuyến 1: {trip.firstTrip.busName} ({trip.firstTrip.fromLocation} → {trip.firstTrip.endLocation})</p>
                                        <p>Chuyến 2: {trip.secondTrip.busName} ({trip.secondTrip.fromLocation} → {trip.secondTrip.endLocation})</p>
                                        <button onClick={() => handleBookTicket([trip.firstTrip, trip.secondTrip])} className='book-button'>
                                            Đặt vé
                                        </button>
                                    </div>
                                ))}

                                {searchResults?.tripleTrips?.map((trip) => (
                                    <div key={`${trip.firstTrip.tripId}-${trip.secondTrip.tripId}-${trip.thirdTrip.tripId}`} className="trip-card">
                                        <h3>{trip.firstTrip.fromLocation} → {trip.thirdTrip.endLocation}</h3>
                                        <p>Thời gian bắt đầu: {formatTime(trip.firstTrip.timeStart)}</p>
                                        <p>Thời gian kết thúc: {formatTime(trip.thirdTrip.timeEnd)}</p>
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
                </main>
            </div>
            <div className='search-results-footer'>
                <Footer />
            </div>
        </div>
    );
};

export default SearchResultsPage;