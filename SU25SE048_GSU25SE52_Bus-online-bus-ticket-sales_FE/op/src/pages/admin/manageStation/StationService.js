import axios from 'axios';
import { environment } from '../../../environment/environment';

const API_URL = `${environment.apiUrl}/Station`;

const StationService = {
    getAllStations: async () => {
        try {
            const response = await axios.get(`${API_URL}/GetAllStation`);
            return response.data;
        } catch (error) {
            console.error('Error fetching stations:', error);
            throw error;
        }
    },

    getStationById: async (id) => {
        try {
            const response = await axios.get(`${API_URL}/GetStationById?id=${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching station with id ${id}:`, error);
            throw error;
        }
    },

    createStation: async (stationData) => {
        try {
            const response = await axios.post(`${API_URL}/CreateStation`, {
                name: stationData.name,
                locationId: parseInt(stationData.locationId), // Chuyển đổi thành số
                status: parseInt(stationData.status) // Chuyển đổi thành số
            });
            return response.data;
        } catch (error) {
            console.error('Error creating station:', error);
            throw error;
        }
    },

    updateStation: async (id, stationData) => {
        try {
            if (!id) throw new Error('Station ID is required');
            if (!stationData.name) throw new Error('Name is required');
            const response = await axios.put(`${API_URL}/UpdateStation?id=${id}`, {
                id: id,
                name: stationData.name,
                locationId: parseInt(stationData.locationId),
                status: parseInt(stationData.status)
            });
            console.log('Update response: ', response.data);
            return response.data;
        } catch (error) {
            console.error(`Error updating station with id ${id}:`, error);
            // Thêm thông tin lỗi chi tiết
            if (error.response) {
                console.error('Response data:', error.response.data);
                console.error('Response status:', error.response.status);
                console.error('Response headers:', error.response.headers);
            }
            throw error;
        }
    },

    softDeleteStation: async (id) => {
        try {
            const response = await axios.delete(`${API_URL}/DeleteStation?id=${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error soft deleting station with id ${id}:`, error);
            throw error;
        }
    },
};

export default StationService;