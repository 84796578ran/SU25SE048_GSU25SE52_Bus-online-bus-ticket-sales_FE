import React, { useState, useEffect } from 'react';
import '../manageStation/ManageStation.css';

const StationForm = ({ station, isEditing, onSubmit, onClose }) => {
    const [formData, setFormData] = useState({
        id: '',
        name: '',
        locationId: '',
        status: '1'
    });

    useEffect(() => {
        if (station) {
            setFormData({
                id: station.id || '',
                name: station.name || '',
                locationId: station.locationId || '',
                status: station.status?.toString() || '1'
            });
        }
    }, [station]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Chuyển đổi status từ string sang number trước khi gửi
        const dataToSubmit = {
            ...formData,
            locationId: parseInt(formData.locationId) || 0, // Đảm bảo là number
            status: parseInt(formData.status) // Chắc chắn là number
        };
        onSubmit(dataToSubmit);
    };

    return (
        <div id="station-form-modal" className="modal">
            <div className="modal-content">
                <span className="close" onClick={onClose}>&times;</span>
                <h2>{isEditing ? 'Edit Station' : 'Add New Station'}</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Name:</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Location ID:</label>
                        <input
                            type="text"
                            name="locationId"
                            value={formData.locationId}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Status:</label>
                        <select
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                        >
                            <option value="1">Active</option>
                            <option value="0">Inactive</option>
                        </select>
                    </div>
                    <div className="form-actions">
                        <button type="submit" className="btn-submit">
                            {isEditing ? 'Update' : 'Create'}
                        </button>
                        <button type="button" onClick={onClose} className="btn-cancel">
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default StationForm;