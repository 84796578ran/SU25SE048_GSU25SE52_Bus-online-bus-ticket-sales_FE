import { useState } from 'react';
import '../manageStation/ManageStation.css';
import axios from 'axios';
import { environment } from '../../../environment/environment';
const StationManagement = () => {
    const [stations, setStations] = useState([]);
    const [formData, setFormData] = useState({
        stationId: '',
        name: '',
        locationId: '',
        status: 'active',
    });
    const [editingId, setEditingId] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    // Handle input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };
    // Fetch all stations (excluding soft-deleted ones)
    const fetchStations = async () => {
        setIsLoading(true);
        try {
            const response = await axios.get(`${environment.apiUrl}/Station/GetAllStation`);
            setStations(response.data);
            setError('');
        } catch (err) {
            setError('Failed to fetch stations. Please try again.');
            console.error('Error fetching stations:', err);
        } finally {
            setIsLoading(false);
        }
    };
    // Reset form
    const resetForm = () => {
        setFormData({
            stationId: '',
            name: '',
            locationId: '',
            status: 'active'
        });
        setEditingId(null);
    };
    // Create or Update station
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            if (editingId) {
                // Update existing station
                await axios.put(`${environment.apiUrl}/Station/UpdateStation?id=${editingId}`, formData);
            } else {
                // Create new station
                await axios.post(`${environment.apiUrl}/Station/CreateStation`, formData);
            }
            fetchStations();
            resetForm();
        } catch (err) {
            setError(editingId ? 'Failed to update station.' : 'Failed to create station.');
            console.error('Error saving station:', err);
        } finally {
            setIsLoading(false);
        }
    };
    // Edit station
    const handleEdit = (station) => {
        setFormData({
            stationId: station.stationId,
            name: station.name,
            locationId: station.locationId,
            status: station.status
        });
        setEditingId(station.id);
    };
    // Soft delete station
    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this station?')) {
            setIsLoading(true);
            try {
                await axios.patch(`${environment.apiUrl}/Station/DeleteStation?id=${id}`, { isDeleted: true });
                fetchStations();
            } catch (err) {
                setError('Failed to delete station.');
                console.error('Error deleting station:', err);
            } finally {
                setIsLoading(false);
            }
        }
    }
    return (
        <div className='manage-station-container'>
            <h2>Manage Stations</h2>
            {error && <div className="error-message">{error}</div>}
            {/* Station Form */}
            <div className='station-form'>
                <h3>{editingId ? 'Sửa trạm' : 'Thêm trạm'}</h3>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Station ID:</label>
                        <input
                            type="text"
                            name="stationId"
                            value={formData.stationId}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Name:</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Location ID:</label>
                        <input
                            type="text"
                            name="locationId"
                            value={formData.locationId}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <div className="form-actions">
                        <button type="submit" disabled={isLoading}>
                            {isLoading ? 'Processing...' : (editingId ? 'Update' : 'Create')}
                        </button>
                        {editingId && (
                            <button type="button" onClick={resetForm} disabled={isLoading}>
                                Cancel
                            </button>
                        )}
                    </div>
                </form>
            </div>
            {/* Stations List */}
            <div className='stations-list'>
                <h3>Station List</h3>
                {
                    isLoading && !stations.length ? (
                        <p>Loading stations...</p>
                    ) : stations.length === 0 ? (
                        <p>No stations found.</p>
                    ) : (
                        <table>
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Station ID</th>
                                    <th>Name</th>
                                    <th>Location ID</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stations.map(station => (
                                    <tr key={station.id}>
                                        <td>{station.id}</td>
                                        <td>{station.stationId}</td>
                                        <td>{station.name}</td>
                                        <td>{station.locationId}</td>
                                        <td>
                                            <button onClick={() => handleEdit(station)}>Edit</button>
                                            <button
                                                onClick={() => handleDelete(station.id)}
                                                className="delete-btn"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )
                }
            </div>
        </div>
    )
}
export default StationManagement;