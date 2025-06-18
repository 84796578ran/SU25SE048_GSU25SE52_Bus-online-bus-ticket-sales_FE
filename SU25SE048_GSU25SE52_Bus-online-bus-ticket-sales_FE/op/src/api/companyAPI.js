import axios from 'axios';

const API_URL = 'https://localhost:7197/api/Company';

export const getCompanies = async () => {
    try {
        const response = await axios.get(`${API_URL}/GetAllCompany`);
        return response.data;
    } catch (error) {
        console.error('Error fetching companies:', error);
        throw error;
    }
};

export const createCompany = async (companyData) => {
    try {
        const response = await axios.post(`${API_URL}/CreateCompany`, companyData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            }
        });
        console.log('Response:', response); // Kiểm tra phản hồi
        return response.data;
    } catch (error) {
        console.error('Error creating company:', error);
        console.error('Error details:', error.response?.data); // Chi tiết lỗi từ server
        throw error;
    }
};

export const updateCompany = async (id, companyData) => {
    try {
        const response = await axios.put(`${API_URL}/UpdateCompany/${id}`, companyData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error updating company:', error);
        throw error;
    }
};

export const deleteCompany = async (id) => {
    try {
        const response = await axios.delete(`${API_URL}/DeleteCompany/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error deleting company:', error);
        throw error;
    }
};