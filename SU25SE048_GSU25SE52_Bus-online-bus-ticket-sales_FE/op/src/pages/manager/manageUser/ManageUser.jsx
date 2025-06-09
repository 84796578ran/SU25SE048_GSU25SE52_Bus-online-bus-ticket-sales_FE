import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ManageUser.css';

const ManageUser = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await axios.get('https://68366847664e72d28e40a9cf.mockapi.io/api/SearchTickets/User');
            setUsers(response.data);
            setLoading(false);
        } catch (err) {
            setError('Không thể tải danh sách người dùng');
            setLoading(false);
        }
    };

    if (loading) return <div>Đang tải...</div>;
    if (error) return <div className="error">{error}</div>;

    return (
        <div className="manage-user-container">
            <h2>Quản lý người dùng</h2>
            <div className="user-list">
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Tên đăng nhập</th>
                            <th>Email</th>
                            <th>Số điện thoại</th>
                            <th>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
                            <tr key={user.id}>
                                <td>{user.id}</td>
                                <td>{user.username}</td>
                                <td>{user.email}</td>
                                <td>{user.phone}</td>
                                <td>
                                    <button className="edit-btn">Sửa</button>
                                    <button className="delete-btn">Xóa</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ManageUser; 