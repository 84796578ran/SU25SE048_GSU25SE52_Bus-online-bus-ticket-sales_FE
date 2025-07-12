import axios from "axios";
import { useEffect, useState } from "react";
import { environment } from "../../../environment/environment";
import '../manageStation/ManageStation.css';
const StationManagement = () => {
    const [stations, setStations] = useState([]);
    const [formData, setFormData] = useState({
        id: '',
        name: '',
        locationId: '',
        status: 1,
        isDeleted: false,
    });
    const [isEditing, setIsEditing] = useState(false);
    const fetchStations = async () => {
        try {
            const res = await axios.get(`${environment.apiUrl}/Station`);
            console.log("API response:", res.data); // 👈 xem log
            if (Array.isArray(res.data)) {
                setStations(res.data);
            } else if (Array.isArray(res.data.data)) {
                // Trong trường hợp response dạng { data: [...] }
                setStations(res.data.data);
            } else {
                console.error("Invalid stations data format:", res.data);
                setStations([]); // fallback để tránh crash
            }
        } catch (error) {
            console.error('Fetch error:', error);
        }
    }
    useEffect(() => {
        fetchStations();
    }, []);
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };
    const handleCreate = async () => {
        try {
            await axios.post(`${environment.apiUrl}/Station`, {
                name: formData.name,
                locationId: parseInt(formData.locationId),
                status: parseInt(formData.status)
            });
            setFormData({
                id: '',
                name: '',
                locationId: '',
                status: 1,
                isDeleted: false
            });
            fetchStations();
        } catch (error) {
            console.error('Create error:', error);
        }
    }
    const handleEdit = (station) => {
        setFormData({ ...station });
        setIsEditing(true);
    };
    const handleUpdate = async () => {
        try {
            await axios.put(`${environment.apiUrl}/Station/${formData.id}`, {
                name: formData.name,
                locationId: parseInt(formData.locationId),
                status: parseInt(formData.status),
            });
            setFormData({ id: '', name: '', locationId: '', status: 1, isDeleted: false });
            setIsEditing(false);
            fetchStations();
        } catch (error) {
            console.error('Update error:', error);
        }
    };
    const handleDelete = async (id) => {
        try {
            await axios.delete(`${environment.apiUrl}/Station/${id}`);
            fetchStations();
        } catch (error) {
            console.error('Delete error:', error);
        }
    }
    return (
        <div className="station-management">
            <h2>Quản lý trạm</h2>
            <div className="station-form">
                <input name="name" placeholder="Name" value={formData.name} onChange={handleInputChange} />
                <input name="locationId" placeholder="Location ID" value={formData.locationId} onChange={handleInputChange} />
                <select name="status" value={formData.status} onChange={handleInputChange}>
                    <option value={1}>Active</option>
                    <option value={0}>Inactive</option>
                </select>
                {isEditing ? (
                    <button onClick={handleUpdate}>Update</button>
                ) : (
                    <button onClick={handleCreate} className="create-button">Create</button>
                )}
                <table className="station-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {stations.map((station) => (
                            <tr key={station.id}>
                                <td>{station.name}</td>
                                <td>{station.status === 1 ? 'Active' : 'Inactive'}</td>
                                <td>
                                    <button onClick={() => handleEdit(station)}>Edit</button>
                                    <button onClick={() => handleDelete(station.id)}>Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
export default StationManagement;