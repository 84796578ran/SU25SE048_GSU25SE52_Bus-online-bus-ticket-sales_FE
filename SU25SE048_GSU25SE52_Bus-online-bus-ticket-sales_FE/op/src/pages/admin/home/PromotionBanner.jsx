import React, { useEffect, useState } from 'react';
import { fetchPromotions } from '../../../API/api';

const PromotionBanner = () => {
    const [promotions, setPromotions] = useState([]);
    const [currentPromo, setCurrentPromo] = useState(0);

    useEffect(() => {
        const loadPromotions = async () => {
            const data = await fetchPromotions();
            setPromotions(data);
        };
        loadPromotions();
    }, []);
    useEffect(() => {
        if (promotions.length > 1) {
            const timer = setInterval(() => {
                setCurrentPromo((prev) => (prev + 1) % promotions.length);
            }, 5000);
            return () => clearInterval(timer);
        }
    }, [promotions.length]);
    if (promotions.length === 0) return null;
    return (
        <section className="promotion-banner">
            <div className="promo-slide">
                <img
                    src={promotions[currentPromo].imageUrl}
                    alt={promotions[currentPromo].title}
                />
                <div className="promo-content">
                    <h3>{promotions[currentPromo].title}</h3>
                    <p>{promotions[currentPromo].description}</p>
                    <button className="promo-btn">Xem chi tiết</button>
                </div>
            </div>
        </section>
    );
};
export default PromotionBanner;