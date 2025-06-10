import axios from 'axios';

const API_BASE_URL = 'https://68366847664e72d28e40a9cf.mockapi.io/api/SearchTickets';

// API calls for routes
export const getPopularRoutes = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/Routes`);
        return response.data;
    } catch (error) {
        console.error('Error fetching popular routes:', error);
        throw error;
    }
};

// API calls for promotions
export const getPromotions = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/Promotions`);
        return response.data;
    } catch (error) {
        console.error('Error fetching promotions:', error);
        throw error;
    }
};

// API calls for users
export const getUsers = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/User`);
        return response.data;
    } catch (error) {
        console.error('Error fetching users:', error);
        throw error;
    }
};

// API calls for tickets
export const getTickets = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/Tickets`);
        return response.data;
    } catch (error) {
        console.error('Error fetching tickets:', error);
        throw error;
    }
};

export default {
    getPopularRoutes,
    getPromotions,
    getUsers,
    getTickets
}; 