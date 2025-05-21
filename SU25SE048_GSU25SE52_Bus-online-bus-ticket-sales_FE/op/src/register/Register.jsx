import { useState } from 'react';
import '../register/Register.css';
import axios from 'axios';
import { Link } from 'react-router-dom';
const RegisterForm = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        })
    }
    const handleSubmit = async (e) => {
        e.preventDefault();
        // Kiểm tra confirmPassword
        if (formData.confirmPassword !== formData.password) {
            setError('Mat khau xac nhan khong khop');
            return;
        }
        setError('');
        try {
            const response = await axios.post('https://api.example.com/register', formData);
            alert('Dang ky thanh cong: ' + response.data.message);
        } catch (error) {
            alert('Loi dang ky: ' + error.response.data.message);
        }
    }
    return (
        <div className='register-container'>
            <h2>Đăng ký</h2>
            <form onSubmit={handleSubmit}>
                <input type="text" name="name" placeholder="Tên" onChange={handleChange} value={formData.name} required />
                <input type="email" name="email" placeholder="Email" onChange={handleChange} value={formData.email} required />
                <input type='text' name='phone' placeholder='Số điện thoại' onChange={handleChange} value={formData.phone} required />
                <input type="password" name="password" placeholder="Mật khẩu" onChange={handleChange} value={formData.password} required />
                <input type="password" name="confirmPassword" placeholder="Xác nhận mật khẩu" onChange={handleChange} value={formData.confirmPassword} required />
                {error && <p className="error-message">{error}</p>} {/* Hiển thị lỗi nếu có */}
                <button type="submit">Đăng ký</button>
                <p className='login-link'>
                    Đã có tài khoản? <Link to='/'>Đăng nhập</Link>
                </p>
            </form>
        </div>
    )
}
export default RegisterForm;