import axios from 'axios';
const API_BASE_URL = 'https://your-api-endpoint.com/api';
export const getPopularRoutes = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/routes/popular`);
        return response.data;
    } catch (error) {
        console.error('Error fetching popular routes:', error);
        return [];
    }
};
export const searchTrips = async (departure, destination, date) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/trips/search`, {
            params: { departure, destination, date }
        });
        return response.data;
    } catch (error) {
        console.error('Error searching trips:', error);
        return [];
    }
};
export const getPromotions = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/promotions`);
        return response.data;
    } catch (error) {
        console.error('Error fetching promotions:', error);
        return [];
    }
};
