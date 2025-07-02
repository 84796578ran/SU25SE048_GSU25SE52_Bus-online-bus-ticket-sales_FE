import { useEffect, useState } from 'react';
import '../manageLocation/ManageLocation.css';
import axios from 'axios';
import { environment } from '../../../environment/environment';
const LocationManagement = () => {
    const [locations, setLocations] = useState([]);
    const [formData, setFormData] = useState({
        id: '',
        Name: '',
        timeTransit: '',
        Note: '',
        isDeleted: false
    });
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    useEffect(() => {
        const fetchLocations = async () => {
            try {
                const response = await axios.get(`${environment.apiUrl}/Location/GetAllLocations`);
                setLocations(response.data);
                setLoading(false);
            } catch (err) {
                setError(err.message);
                setLoading(false);
            }
        };
        fetchLocations();
    }, []);
    // Handle input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };
    // Handle checkbox change
    const handleCheckboxChange = (e) => {
        setFormData({
            ...formData,
            isDeleted: e.target.checked
        });
    };
    // Reset form
    const resetForm = () => {
        setFormData({
            id: '',
            Name: '',
            timeTransit: '',
            Note: '',
            isDeleted: false
        });
        setIsEditing(false);
    };
    // Create or Update location
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (isEditing) {
                // Update existing location
                const updatedLocation = {
                    ...formData,
                    update_At: new Date().toISOString()
                }
                await axios.put(`${environment.apiUrl}/Location/UpdateLocation?id=${formData.id}`, updatedLocation);
            } else {
                const newLocation = {
                    ...formData,
                    create_At: new Date().toISOString(),
                    update_At: new Date().toISOString()
                };
                await axios.post(`${environment.apiUrl}/Location/CreateLocation`, newLocation);
            }
            const response = await axios.get(`${environment.apiUrl}/Location/GetAllLocations`);
            setLocations(response.data);
            resetForm();
            setLoading(false);
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    }
    // Edit location
    const handleEdit = (location) => {
        setFormData({
            id: location.id,
            Name: location.Name,
            timeTransit: location.timeTransit,
            Note: location.Note,
            isDeleted: location.isDeleted
        });
        setIsEditing(true);
    };
    // Delete location (Soft delete)
    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this location?')) {
            setLoading(true);
            try {
                await axios.patch(`${environment.apiUrl}/Location/DeleteLocation?id=${id}`,
                    { isDeleted: true }
                );
                const response = await axios.get(`${environment.apiUrl}/Location/GetAllLocations`);
                setLocations(response.data);
                setLoading(false);
            } catch (err) {
                setError(err.message);
                setLoading(false);
            }
        }
    }
    if (loading) return <div className="loading">Loading...</div>;
    if (error) return <div className="error">Error: {error}</div>;
    return (
        <div className='location-management'>
            <h1>Manage Locations</h1>
            {/* Location Form */}
            <div className='location-form'>
                <h2>
                    {isEditing ? 'Edit location' : 'Add new location'}
                </h2>
                <form onSubmit={handleSubmit}>
                    <div className='form-group'>
                        <label>Name:</label>
                        <input
                            type="text"
                            name="Name"
                            value={formData.Name}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <div className='form-group'>
                        <label>Transit Time (minutes):</label>
                        <input
                            type="number"
                            name="timeTransit"
                            value={formData.timeTransit}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Notes:</label>
                        <textarea
                            name="Note"
                            value={formData.Note}
                            onChange={handleInputChange}
                        />
                    </div>
                    <div className="form-actions">
                        <button type="submit">{isEditing ? 'Update' : 'Create'}</button>
                        {isEditing && (
                            <button type="button" onClick={resetForm}>Cancel</button>
                        )}
                    </div>
                </form>
            </div>
            <div className='locations-list'>
                <h2>Locations</h2>
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Transit Time</th>
                            <th>Created At</th>
                            <th>Updated At</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            locations.map((location) => (
                                <tr key={location.id} className={location.isDeleted ? 'deleted' : ''}>
                                    <td>
                                        {location.id}
                                    </td>
                                    <td>
                                        {location.Name}
                                    </td>
                                    <td>
                                        {location.timeTransit}
                                    </td>
                                    <td>{new Date(location.create_At).toLocaleString()}</td>
                                    <td>{new Date(location.update_At).toLocaleString()}</td>
                                    <td className='actions'>
                                        <button onClick={() => handleEdit(location)}>Edit</button>
                                        <button onClick={() => handleDelete(location.id)}>Delete</button>
                                    </td>
                                </tr>
                            ))
                        }
                    </tbody>
                </table>
            </div>
        </div>
    )
}
export default LocationManagement;