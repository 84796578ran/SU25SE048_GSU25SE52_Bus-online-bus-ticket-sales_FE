import { useEffect, useState } from "react";
import axios from 'axios';
import { toast } from 'react-toastify';
import '../manageUser/ManageUser.css';
import Menu from "../menu/Menu";
const ManageUsers = () => {
    // State for users list and form data
    const [users, setUsers] = useState([]);
    const [formData, setFormData] = useState({
        email: '',
        full_name: '',
        phone: '',
        address: '',
        role_id: 2,
        company_id: null,
        password: '',
        isActive: true,
        isDeleted: false
    });
    const [editingId, setEditingId] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [roles, setRoles] = useState([]);
    const [companies, setCompanies] = useState([]);
    // API base URL
    const API_URL = 'https://683ac9b843bb370a8673bd67.mockapi.io/api/BusRoutes/User';
    // Fetch users, roles, and companies on component amount
    useEffect(() => {
        fetchUsers();
        fetchRoles();
        fetchCompanies();
    }, []);
    const fetchUsers = async () => {
        setIsLoading(true);
        try {
            const response = await axios.get(API_URL);
            setUsers(response.data.filter(user => !user.isDeleted));
        } catch (error) {
            toast.error('Failed to fetch users: ' + error.message);
        } finally {
            setIsLoading(false);
        }
    }
    const fetchRoles = async () => {
        try {
            const response = await axios.get(API_URL);
            setRoles(response.data);
        } catch (error) {
            toast.error('Failed to fetch roles: ' + error.message);
        }
    };

    const fetchCompanies = async () => {
        try {
            const response = await axios.get(API_URL);
            setCompanies(response.data);
        } catch (error) {
            toast.error('Failed to fetch companies: ' + error.message);
        }
    };
    // Handle form input changes
    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
    };
    // Reset form
    const resetForm = () => {
        setFormData({
            email: '',
            full_name: '',
            phone: '',
            address: '',
            role_id: 2,
            company_id: null,
            password: '',
            avatar_url: '',
            isActive: true,
            isDeleted: false
        });
        setEditingId(null);
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            if (editingId) {
                // Update existing user
                await axios.put(`${API_URL}/${editingId}`, formData);
                toast.success('User updated successfully');
            } else {
                // Create new user
                await axios.post(API_URL, formData);
                toast.success('User created successfully');
            }
            resetForm();
            fetchUsers();
        } catch (error) {
            toast.error(`Error ${editingId ? 'updating' : 'creating'} user: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };
    // Edit user
    const handleEdit = (user) => {
        setFormData({
            email: user.email,
            full_name: user.full_name,
            phone: user.phone,
            address: user.address,
            role_id: user.role_id,
            company_id: user.company_id,
            password: user.password,
            isActive: user.isActive,
            isDeleted: false
        });
        setEditingId(user.id);
    };
    const deleteUser = async (id) => {
        setIsLoading(true);
        try {
            await axios.put(`${API_URL}/${id}`, {
                ...users.find(user => user.id === id),
                isDeleted: true
            });
            toast.success('User deleted successfully');
            fetchUsers();
        } catch (error) {
            toast.error('Failed to delete user: ' + error.message);
        } finally {
            setIsLoading(false);
        }
    };
    // Toggle user active status
    const toggleActiveStatus = async (id, currentStatus) => {
        setIsLoading(true);
        try {
            await axios.patch(`${API_URL}/${id}`, {
                isActive: !currentStatus
            });
            toast.success(`User ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
            fetchUsers();
        } catch (error) {
            toast.error('Failed to update user status: ' + error.message);
        } finally {
            setIsLoading(false);
        }
    }
    return (
        <div className="manage-users-page">
            <Menu />
            <div className="manage-users-container">
                <h2>
                    {editingId ? 'Chỉnh sửa người dùng' : 'Thêm người dùng'}
                </h2>
                {/* User Form */}
                <form onSubmit={handleSubmit} className="user-form">
                    <div className="form-row">
                        <div className="form-group">
                            <label>Email</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Họ và tên</label>
                            <input
                                type="text"
                                name="full_name"
                                value={formData.full_name}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Số điện thoại</label>
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Địa chỉ</label>
                            <input
                                type="text"
                                name="address"
                                value={formData.address}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Mật khẩu</label>
                            <input type="password" name="password"
                                value={formData.password} onChange={handleInputChange}
                                required={!editingId} minLength='6' />
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group checkbox-group">
                            <label>
                                <input
                                    type="checkbox"
                                    name="isActive"
                                    checked={formData.isActive}
                                    onChange={handleInputChange}
                                />
                                Active
                            </label>
                        </div>
                    </div>
                    <div className="form-actions">
                        <button type="submit" disabled={isLoading}>
                            {isLoading ? 'Processing...' : (editingId ? 'Cập nhật người dùng' : 'Thêm người dùng')}
                        </button>
                        {editingId && (
                            <button type="button" onClick={resetForm} disabled={isLoading}>
                                Hủy
                            </button>
                        )}
                    </div>
                </form>
                {/*Users List */}
                <h2>Danh sách người dùng</h2>
                {isLoading && !users.length ? (
                    <div className="loading">Loading users...</div>
                ) : (
                    <div className="users-table-container">
                        <table className="users-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Họ và Tên</th>
                                    <th>Email</th>
                                    <th>Địa chỉ</th>
                                    <th>Số điện thoại</th>
                                    <th>Vai trò</th>
                                    <th>Trạng thái</th>
                                    <th>Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(user => (
                                    <tr key={user.id} className={!user.isActive ? 'inactive' : ''}>
                                        <td>
                                            {user.id}
                                        </td>
                                        <td>
                                            {user.full_name}
                                        </td>
                                        <td>
                                            {user.email}
                                        </td>
                                        <td>
                                            {user.address}
                                        </td>
                                        <td>
                                            {user.phone}
                                        </td>
                                        <td>
                                            {roles.find(r => r.id === user.role_id)?.name ||
                                                user.role_id}
                                        </td>
                                        <td>
                                            <span className={`status-badge ${user.isActive ?
                                                'active' : 'inactive'
                                                }`}>
                                                {
                                                    user.isActive ? 'Active' : 'Inactive'
                                                }
                                            </span>
                                        </td>
                                        <td className="actions">
                                            <button onClick={() => handleEdit(user)}>Sửa</button>
                                            <button onClick={() => toggleActiveStatus(user.id, user.isActive)}>
                                                {user.isActive ? 'Không kích hoạt' : 'Kích hoạt'}
                                            </button>
                                            <button onClick={() => deleteUser(user.id)}>Xóa</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    )
}
export default ManageUsers;