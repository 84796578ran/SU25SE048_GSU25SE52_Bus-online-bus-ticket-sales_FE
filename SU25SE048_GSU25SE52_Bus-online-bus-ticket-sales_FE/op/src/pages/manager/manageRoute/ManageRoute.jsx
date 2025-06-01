import { useEffect, useState } from 'react';
import '../manageRoute/ManageRoute.css';
import { toast } from 'react-toastify';
import axios from 'axios';
const ManageRoute = () => {
    const [routes, setRoutes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        name: '',
        company_id: '',
        station_id: '',
        estimatedDuration: '',
        description: '',
        isActive: true,
        journeyLicense: null
    });
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    // Fetch all routes
    useEffect(() => {
        const fetchRoutes = async () => {
            try {
                const response = await axios.get('https://683ac9b843bb370a8673bd67.mockapi.io/api/BusRoutes/Route', {
                    params: {
                        companyID: formData.company_id
                    }
                });
                setRoutes(response.data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching routes:', error);
                toast.error('Failed to load routes');
                setLoading(false);
            }
        };
        fetchRoutes();
    }, [formData.company_id]);
    // Handle form input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };
    // Handle file input changes
    const handleFileChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.files[0]
        });
    };
    // Create new route
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.journeyLicense && !editingId) {
            toast.error('Journey license is required');
            return;
        }
        console.log('Form data before submit:', formData); // Thêm dòng này để debug
        const data = {
            company_id: formData.company_id,
            name: formData.name,
            station_id: formData.station_id,
            estimatedDuration: formData.estimatedDuration,
            description: formData.description,
        }
        try {
            const url = editingId
                ? `https://683ac9b843bb370a8673bd67.mockapi.io/api/BusRoutes/Route/${editingId}`
                : 'https://683ac9b843bb370a8673bd67.mockapi.io/api/BusRoutes/Route';

            const method = editingId ? 'put' : 'post';

            const response = await axios[method](url, data);

            if (editingId) {
                setRoutes(routes.map(route =>
                    route.id === editingId ? response.data : route
                ));
                toast.success('Route updated successfully');
            } else {
                setRoutes([...routes, response.data]);
                toast.success('Route created successfully');
            }

            setShowCreateModal(false);
            setShowEditModal(false);
            setEditingId(null);
            resetFormData(); // Reset the form after successful submission
        } catch (error) {
            console.error('Error creating route:', error);
            let errorMessage = 'Failed to create route';
            // Thêm log chi tiết lỗi
            if (error.response) {
                console.log('Error response data:', error.response.data);
                console.log('Error status:', error.response.status);
                if (error.response.data) {
                    errorMessage = error.response.data.message || JSON.stringify(error.response.data);
                }
            }
            toast.error(errorMessage);
        }
    };
    // Handle edit route
    const handleEdit = (route) => {
        setFormData({
            name: route.name,
            company_id: route.company_id,
            station_id: route.station_id,
            estimatedDuration: route.estimatedDuration,
            description: route.description,
            isActive: route.isActive,
            journeyLicense: null // Reset file input when editing
        });
        setEditingId(route.id);
        setShowEditModal(true);
    };
    const handleDelete = async (id) => {
        if (window.confirm('Bạn có muốn xóa không?')) {
            try {
                await axios.delete(`https://683ac9b843bb370a8673bd67.mockapi.io/api/BusRoutes/Route/${id}`);
                setRoutes(routes.map(route =>
                    route.id === id ? {
                        ...route,
                        isDeleted: true
                    } : route
                ));
                toast.success('Route deleted successfully');
            } catch (error) {
                console.error('Error deleting route: ', error);
                toast.error('Failed to delete route');
            }
        }
    };
    // Toggle route active status
    const toggleActive = async (id, currentStatus) => {
        try {
            await axios.patch(`https://683ac9b843bb370a8673bd67.mockapi.io/api/BusRoutes/Route/${id}`,
                {
                    isActive: !currentStatus
                }
            );
            setRoutes(routes.map(route =>
                route.id === id ?
                    {
                        ...route,
                        isActive: !currentStatus
                    } : route
            ));
            toast.success('Route status updated');
        } catch (error) {
            console.error('Error updating route status:', error);
            toast.error('Failed to update route status');
        }
    };
    // Reset form data
    const resetFormData = () => {
        setFormData({
            name: '',
            company_id: '',
            station_id: '',
            estimatedDuration: '',
            description: '',
            isActive: true,
            journeyLicense: null
        });
    };
    return (
        <div className='route-management-container'>
            <h1>Route Management</h1>
            <div className="headers">
                <button
                    className="create-button"
                    onClick={() => setShowCreateModal(true)}
                >
                    Create New Route
                </button>
            </div>
            {loading ? (
                <div className='loading'>Loading routes...</div>
            ) : (
                <div className='routes-table-container'>
                    <table className='routes-table'>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Name</th>
                                <th>Company ID</th>
                                <th>Station ID</th>
                                <th>Duration</th>
                                <th>Description</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                routes.filter(route => !route.isDeleted).map(route => (
                                    <tr key={route.id}>
                                        <td>
                                            {route.id}
                                        </td>
                                        <td>
                                            {route.name}
                                        </td>
                                        <td>
                                            {route.company_id}
                                        </td>
                                        <td>
                                            {route.station_id}
                                        </td>
                                        <td>
                                            {route.estimatedDuration}
                                        </td>
                                        <td className='description-cell'>
                                            {route.description.length > 50
                                                ? `${route.description.substring(0, 50)}...`
                                                : route.description}
                                        </td>
                                        <td>
                                            <span className={`status-badge ${route.isActive ? 'active' : 'inactive'}`}>
                                                {route.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className='actions-cell'>
                                            <button
                                                className={`status-button ${route.isActive ? 'deactivate' : 'activate'}`}
                                                onClick={() => toggleActive(route.id, route.isActive)}
                                            >
                                                {route.isActive ? 'Deactivate' : 'Activate'}
                                            </button>
                                            <button
                                                className="delete-button"
                                                onClick={() => handleDelete(route.id)}
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            }
                        </tbody>
                    </table>
                </div>
            )}
            {/* Create Route Modal */}
            {showCreateModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2>Create New Route</h2>
                            <button
                                className="close-button"
                                onClick={() => setShowCreateModal(false)}
                            >
                                &times;
                            </button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Company ID:</label>
                                <input
                                    type="text"
                                    name="company_id"
                                    value={formData.company_id}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Route Name:</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Station ID:</label>
                                <input
                                    type="text"
                                    name="station_id"
                                    value={formData.station_id}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Description:</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    rows="3"
                                />
                            </div>
                            <div className="form-group">
                                <label>Estimated Duration:</label>
                                <input
                                    type="text"
                                    name="estimatedDuration"
                                    value={formData.estimatedDuration}
                                    onChange={handleInputChange}
                                    placeholder="e.g., 2 hours 30 minutes"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Journey License (PDF/Image):</label>
                                <input
                                    type="file"
                                    name="journeyLicense"
                                    onChange={handleFileChange}
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    required
                                />
                            </div>
                            <div className="form-actions">
                                <button type="submit" className="submit-button" disabled={loading}>
                                    {loading ? 'Processing...' : editingId ? 'Update Route' : 'Create Route'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
export default ManageRoute;