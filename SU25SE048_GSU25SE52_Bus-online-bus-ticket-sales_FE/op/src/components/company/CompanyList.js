import React, { useState, useEffect } from 'react';
import CompanyItem from './CompanyItem';
import { deleteCompany, getCompanies } from '../../api/companyAPI';
const CompanyList = ({ onEdit }) => {
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchCompanies();
    }, []);

    const fetchCompanies = async () => {
        try {
            const data = await getCompanies();
            setCompanies(data);
            setLoading(false);
        } catch (error) {
            setError(error.message);
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            await deleteCompany(id);
            fetchCompanies();
        } catch (error) {
            console.error('Error deleting company:', error);
        }
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div className="company-list">
            <h2>Danh sách công ty</h2>
            <table>
                <thead>
                    <tr>
                        <th>Tên công ty</th>
                        <th>Số điện thoại</th>
                        <th>Địa chỉ</th>
                        <th>Trạng thái</th>
                        <th>Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    {companies.map(company => (
                        <CompanyItem
                            key={company.id}
                            company={company}
                            onEdit={onEdit}
                            onDelete={handleDelete}
                        />
                    ))}
                </tbody>
            </table>
        </div>
    );
};
export default CompanyList;