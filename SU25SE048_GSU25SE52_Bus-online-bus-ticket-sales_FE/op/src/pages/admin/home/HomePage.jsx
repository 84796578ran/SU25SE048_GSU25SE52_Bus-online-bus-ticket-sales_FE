import { useState } from "react";
import PopularRoutes from "./PopularRoutes";

import '../home/HomePage.css';
import SearchForm from "./SearchForm";
import PromotionBanner from "../home/PromotionBanner";
import Header from "../../../components/header/Header";
import Footer from "../../../components/footer/Footer";
const HomePage = () => {
    const [searchResults, setSearchResults] = useState(null);
    return (
        <div className="home-page-container">
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
                                            <div key={trip.id} className="trip-card">
                                                <h3>
                                                    {trip.FromLocation} → {trip.EndLocation}
                                                </h3>
                                                <p>
                                                    Thời gian bắt đầu: {trip.timeStart}
                                                </p>
                                                <p>
                                                    Thời gian kết thúc: {trip.timeEnd}
                                                </p>
                                                <p>
                                                    Khoảng cách: {trip.distance} km
                                                </p>
                                                <p>
                                                    Giá vé: {trip.price.toLocaleString()} VND
                                                </p>
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
            <div className="home-page-footer">
                <Footer />
            </div>
        </div>
    );
};
export default HomePage;