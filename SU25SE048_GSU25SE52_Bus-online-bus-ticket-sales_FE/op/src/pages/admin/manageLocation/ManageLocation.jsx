import { useEffect, useState } from 'react';
import '../manageLocation/ManageLocation.css';
import axios from 'axios';
import { environment } from '../../../environment/environment';
const LocationManagement = () => {
    const [locations, setLocations] = useState([]);
    const [formData, setFormData] = useState({
        id: '',
        name: '',
        timeTransit: '',
        note: '',
    });
    const [isEditing, setIsEditing] = useState(false);

    const fetchLocations = async () => {
        try {
            const res = await axios.get(`${environment.apiUrl}/Location`);
            console.log("API response:", res.data);
            setLocations(Array.isArray(res.data) ? res.data : res.data.data || []);
        } catch (err) {
            console.error(err);
        }
    };
    useEffect(() => {
        fetchLocations();
    }, []);
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEditing) {
                await axios.put(`${environment.apiUrl}/Location/${formData.id}`, formData);
            } else {
                await axios.post(`${environment.apiUrl}/Location`, formData);
            }
            fetchLocations();
            setFormData({ id: '', name: '', timeTransit: '', note: '' });
            setIsEditing(false);
        } catch (err) {
            console.error(err);
        }
    };
    const handleEdit = (loc) => {
        setFormData({
            id: loc.id,
            name: loc.name,
            timeTransit: loc.timeTransit,
            note: loc.note,
        });
        setIsEditing(true);
    };
    const handleDelete = async (id) => {
        try {
            await axios.delete(`${environment.apiUrl}/Location/${id}`);
            fetchLocations();
        } catch (err) {
            console.error(err);
        }
    };
    return (
        <div className='location-management'>
            <h2>Quản lý điểm đi</h2>
            <form onSubmit={handleSubmit} className='manage-location'>
                <input
                    type="text"
                    name="name"
                    placeholder="Name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                />
                <input
                    type="number"
                    name="timeTransit"
                    placeholder="Time Transit"
                    value={formData.timeTransit}
                    onChange={handleChange}
                    required
                />
                <input
                    type="text"
                    name="note"
                    placeholder="Note"
                    value={formData.note}
                    onChange={handleChange}
                />
                <button type="submit">{isEditing ? 'Update' : 'Create'}</button>
            </form>
            <table className='manage-locations-table'>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Time transit</th>
                        <th>Note</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {locations.map((loc) => (
                        <tr key={loc.id}>
                            <td>{loc.id}</td>
                            <td>{loc.name}</td>
                            <td>{loc.timeTransit}</td>
                            <td>{loc.note}</td>
                            <td>
                                <button onClick={() => handleEdit(loc)}>Edit</button>
                                <button onClick={() => handleDelete(loc.id)}>Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}
export default LocationManagement;