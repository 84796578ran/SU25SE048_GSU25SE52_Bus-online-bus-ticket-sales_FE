import React, { useState } from 'react';
import { createCompany, updateCompany } from '../../api/companyAPI';

const CompanyForm = ({ company, onSuccess, onCancel }) => {
    const [formData, setFormData] = useState(company || {
        name: '',
        website: '',
        phone: '',
        address: '',
        status: 0,
        taxNumber: '',
        description: '',
        companyId: '',
        logo: null,
        maxPercent: 0,
        minPercent: 0
    });
    const handleFileChange = (e) => {
        setFormData({
            ...formData,
            logo: e.target.files[0]
        });
    };
    const [error, setError] = useState(null);
    // Cập nhật tất cả các handleChange để sử dụng tên trường viết hoa
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };
    const [isSubmitting, setIsSubmitting] = useState(false);
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);
        try {
            const formDataToSend = new FormData();
            // Sử dụng tên trường đúng như backend mong đợi (viết thường)
            formDataToSend.append('companyId', formData.companyId || '');
            formDataToSend.append('name', formData.name || '');
            formDataToSend.append('phone', formData.phone || '');
            formDataToSend.append('address', formData.address || '');
            formDataToSend.append('website', formData.website || '');
            formDataToSend.append('status', String(formData.status))
            formDataToSend.append('taxNumber', formData.taxNumber || '');
            formDataToSend.append('description', formData.description || '');
            formDataToSend.append('maxPercent', Number(formData.maxPercent) || 0);
            formDataToSend.append('minPercent', Number(formData.minPercent) || 0);
            if (formData.logo) {
                formDataToSend.append('logo', formData.logo);
            }
            if (company) {
                await updateCompany(company.id, formDataToSend);
            } else {
                await createCompany(formDataToSend);
            }
            onSuccess();
        } catch (error) {
            console.error('Error saving company:', error);
            setError(error.response?.data?.message || 'Có lỗi xảy ra khi tạo công ty');
        } finally {
            setIsSubmitting(false);
        }
    };
    const handleNumberChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value === '' ? '' : Number(value)
        });
    };
    return (
        <form onSubmit={handleSubmit} className="company-form">
            {error && (
                <div className="error-message" style={{ color: 'red', marginBottom: '16px' }}>
                    {error}
                </div>
            )}
            <div className='form-group'>
                <label>Company ID</label>
                <input type='text' name='companyId'
                    value={formData.companyId}
                    onChange={handleChange} />
            </div>
            <div className="form-group">
                <label>Tên công ty</label>
                <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                />
            </div>

            <div className="form-group">
                <label>Số điện thoại</label>
                <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                />
            </div>
            <div className="form-group">
                <label>Địa chỉ</label>
                <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                />
            </div>
            <div className="form-group">
                <label>Website</label>
                <input
                    type="text"
                    name="website"
                    value={formData.website}
                    onChange={handleChange}
                />
            </div>
            <div className="form-group">
                <label>Trạng thái</label>
                <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    required
                >
                    <option value={0}>Ngừng hoạt động</option>
                    <option value={1}>Hoạt động</option>
                </select>
            </div>
            <div className="form-group">
                <label>Mã số thuế</label>
                <input
                    type="text"
                    name="taxNumber"
                    value={formData.taxNumber}
                    onChange={handleChange}
                />
            </div>
            <div className="form-group">
                <label>Mô tả</label>
                <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                />
            </div>
            <div className="form-group">
                <label>Phần trăm cao nhất</label>
                <input type='number'
                    name="maxPercent"
                    value={formData.maxPercent}
                    onChange={handleNumberChange} min="0"
                    max="100"
                />
            </div>
            <div className='form-group'>
                <label>Phần trăm thấp nhất</label>
                <input type='number'
                    name="minPercent"
                    value={formData.minPercent}
                    onChange={handleNumberChange}
                    min="0"
                    max="100"
                />
            </div>
            <div className="form-group">
                <label>Logo</label>
                <input
                    type="file"
                    name="logo"
                    onChange={handleFileChange}
                    accept="image/*"
                />
            </div>
            <div className="form-actions">
                <button type="submit" className="btn-save" disabled={isSubmitting}>
                    {isSubmitting ? 'Đang xử lý...' : 'Tạo công ty'}
                </button>
                <button type="button" onClick={onCancel} className="btn-cancel">Hủy</button>
            </div>
        </form>
    );
};
export default CompanyForm;