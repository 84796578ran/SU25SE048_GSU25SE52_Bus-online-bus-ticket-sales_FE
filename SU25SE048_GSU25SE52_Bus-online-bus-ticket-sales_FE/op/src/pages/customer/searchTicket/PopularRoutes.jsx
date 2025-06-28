import { useEffect, useState } from 'react';
import { getPopularRoutes } from '../../../services/api';
import '../searchTicket/PopularRoutes.css';
const PopularRoutes = () => {
    const [routes, setRoutes] = useState([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const loadRoutes = async () => {
            const data = await getPopularRoutes();
            setRoutes(data);
            setLoading(false);
        };
        loadRoutes();
    }, []);
    if (loading) return <div className="loading">Đang tải...</div>;
    return (
        <section className="popular-routes">
            <h2>Các nhà xe phổ biến</h2>
            <div className="routes-grid">
                {routes.map(route => (
                    <div key={route.id} className="route-card">
                        <div className="route-info">
                            <h3>{route.departure} - {route.destination}</h3>
                            <p>Giá từ: <span className="price">{route.price.toLocaleString()} VNĐ</span></p>
                            <p>Thời gian: {route.duration}</p>
                        </div>
                        <button className="book-now-btn">Đặt ngay</button>
                    </div>
                ))}
            </div>
        </section>
    );
};
export default PopularRoutes;