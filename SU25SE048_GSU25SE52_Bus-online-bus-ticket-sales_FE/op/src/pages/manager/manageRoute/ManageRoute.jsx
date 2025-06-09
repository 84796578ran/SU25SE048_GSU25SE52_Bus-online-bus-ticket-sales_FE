import { useEffect, useState } from 'react';
import '../manageRoute/ManageRoute.css';
import { toast } from 'react-toastify';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import Menu from '../../../components/Manager/menu/Menu';
import { format } from 'date-fns';
import Pagination from '../../../components/pagination/Pagination';
const ManageRoute = () => {
    const [routes, setRoutes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        name: '',
        fromLocation: '',
        routeID: '',
        toLocation: '',
        time: '',
        issuedPlace: '',
        issuedDate: new Date(),
        routeLicense: null,
        isActive: true
    });
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    // Fetch all routes
    useEffect(() => {
        const fetchRoutes = async () => {
            try {
                const response = await axios.get('https://683ac9b843bb370a8673bd67.mockapi.io/api/BusRoutes/Route');
                setRoutes(response.data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching routes:', error);
                toast.error('Failed to load routes');
                setLoading(false);
            }
        };
        fetchRoutes();
    }, []);

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
        if (!formData.routeLicense && !editingId) {
            toast.error('Journey license is required');
            return;
        }
        console.log('Form data before submit:', formData); // Thêm dòng này để debug

        try {
            const data = {
                name: formData.name,
                routeID: formData.routeID,
                time: formData.time,
                fromLocation: formData.fromLocation,
                toLocation: formData.toLocation,
                routeLicense: formData.routeLicense,
                issuedDate: formData.issuedDate,
                issuedPlace: formData.issuedPlace,
                isActive: formData.isActive,
                isDeleted: false
            }
            setLoading(true);
            const response = await axios.post('https://683ac9b843bb370a8673bd67.mockapi.io/api/BusRoutes/Route', data);
            if (response.data && response.data.id) {
                toast.success('Tạo tuyến đường thành công!');
                setRoutes([
                    ...routes,
                    response.data
                ]);
                const updatedResponse = await axios.get('https://683ac9b843bb370a8673bd67.mockapi.io/api/BusRoutes/Route');
                setRoutes(updatedResponse.data);
                setShowCreateModal(false);
                resetFormData();
            }
            if (editingId) {
                // Update existing route
                const response = await axios.put(
                    `https://683ac9b843bb370a8673bd67.mockapi.io/api/BusRoutes/Route/${editingId}`,
                    data
                );
                toast.success('Cập nhật tuyến đường thành công!');
                setRoutes(routes.map(route =>
                    route.id === editingId ? response.data : route
                ));
                setEditingId(null);
                setShowDetailModal(false);
            }
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
        } finally {
            setLoading(false);
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
        });
        setEditingId(route.id);
        setShowEditModal(true);
    };
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return format(date, 'dd/MM/yyyy');
    }
    const handleDelete = async (id) => {
        if (window.confirm('Bạn có muốn xóa không?')) {
            try {
                await axios.put(`https://683ac9b843bb370a8673bd67.mockapi.io/api/BusRoutes/Route/${id}`, {
                    isDeleted: true
                });
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
    const [selectedRoute, setSelectedRoute] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    // Hàm xử lý khi nhấn vào hàng
    const handleRowClick = (route) => {
        setFormData({
            name: route.name,
            routeID: route.routeID,
            time: route.time,
            fromLocation: route.fromLocation,
            toLocation: route.toLocation,
            issuedDate: new Date(route.issuedDate),
            issuedPlace: route.issuedPlace,
            isActive: route.isActive,
            routeLicense: route.routeLicense
        });
        setEditingId(route.id);
        setSelectedRoute(route);
        setShowDetailModal(true);
    }
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    // Lấy chỉ mục của item cuối cùng và đầu tiên trên trang hiện tại
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;

    // Lọc các route không bị xóa và lấy các item cho trang hiện tại
    const currentRoutes = routes
        .filter(route => !route.isDeleted)
        .slice(indexOfFirstItem, indexOfLastItem);

    // Tính tổng số trang
    const totalPages = Math.ceil(routes.filter(route => !route.isDeleted).length / itemsPerPage);
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
            time: '',
            fromLocation: '',
            toLocation: '',
            routeLicense: null,
            isActive: true
        });
    };
    return (
        <div className='route-management-container'>
            <div className='layout-container'>
                <Menu />
                <div className='main-content'>
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
                                        <th>Số hiệu tuyến đường</th>
                                        <th>Tên</th>
                                        <th>Ngày cấp</th>
                                        <th>Nơi cấp</th>
                                        <th>Trạng thái</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {
                                        currentRoutes.filter(route => !route.isDeleted).map(route => (
                                            <tr key={route.id}
                                                onClick={() => handleRowClick(route)}
                                                style={{ cursor: 'pointer' }}
                                            >
                                                <td>
                                                    {route.routeID}
                                                </td>
                                                <td>
                                                    {route.name}
                                                </td>
                                                <td>
                                                    {
                                                        formatDate(route.issuedDate)
                                                    }
                                                </td>
                                                <td>
                                                    {route.issuedPlace}
                                                </td>
                                                <td>
                                                    <span className={`status-badge ${route.isActive ? 'active' : 'inactive'}`}>
                                                        {route.isActive ? "Active" : "Inactive"}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    }
                                </tbody>
                            </table>
                            <Pagination currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={(page) => setCurrentPage(page)} />
                        </div>
                    )}
                    {/* Create Route Modal */}
                    {showCreateModal && (
                        <div className="modal-overlay">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h2>Tạo tuyến đường</h2>
                                    <button
                                        className="close-button"
                                        onClick={() => setShowCreateModal(false)}
                                    >
                                        &times;
                                    </button>
                                </div>
                                <form onSubmit={handleSubmit}>
                                    <div className='form-group'>
                                        <label>Số hiệu tuyến đường:</label>
                                        <input type="text" name="routeID"
                                            value={formData.routeID} onChange={handleInputChange} required />
                                    </div>
                                    <div className="form-group">
                                        <label>Tên chuyến đi:</label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Điểm bắt đầu:</label>
                                        <input
                                            type="text"
                                            name="fromLocation"
                                            value={formData.fromLocation}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Điểm kết thúc:</label>
                                        <input
                                            type="text"
                                            name="toLocation"
                                            value={formData.toLocation}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                    <div className='form-group'>
                                        <label>Ngày cấp:</label>
                                        <DatePicker selected={formData.issuedDate}
                                            onChange={(date) => setFormData({
                                                ...formData,
                                                issuedDate: date
                                            })}
                                            dateFormat="dd/MM/yyyy"
                                            className='form-control' required />
                                    </div>
                                    <div className='form-group'>
                                        <label>Nơi cấp:</label>
                                        <input type='text' name='issuedPlace'
                                            value={formData.issuedPlace} onChange={handleInputChange}
                                            required />
                                    </div>
                                    <div className="form-group">
                                        <label>Giấy cấp phép hành trình:</label>
                                        <input
                                            type="file"
                                            name="routeLicense"
                                            onChange={handleFileChange}
                                            required={!editingId}
                                            accept='.png, .jpg'
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
                    {/* Detail/Edit Modal */}
                    {showDetailModal && (
                        <div className="modal-overlay">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h2>Chi tiết tuyến đường</h2>
                                    <button
                                        className="close-button"
                                        onClick={() => {
                                            setShowDetailModal(false);
                                            setEditingId(null);
                                        }}
                                    >
                                        &times;
                                    </button>
                                </div>
                                <form onSubmit={handleSubmit}>
                                    <div className='form-group'>
                                        <label>Số hiệu tuyến đường:</label>
                                        <input
                                            type="text"
                                            name="routeID"
                                            value={formData.routeID}
                                            onChange={handleInputChange}
                                            disabled={!editingId}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Tên chuyến đi:</label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            disabled={!editingId}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Điểm bắt đầu:</label>
                                        <input
                                            type="text"
                                            name="fromLocation"
                                            value={formData.fromLocation}
                                            onChange={handleInputChange}
                                            disabled={!editingId}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Điểm kết thúc:</label>
                                        <input
                                            type="text"
                                            name="toLocation"
                                            value={formData.toLocation}
                                            onChange={handleInputChange}
                                            disabled={!editingId}
                                        />
                                    </div>
                                    <div className='form-group'>
                                        <label>Ngày cấp:</label>
                                        <DatePicker
                                            selected={formData.issuedDate}
                                            onChange={(date) => setFormData({
                                                ...formData,
                                                issuedDate: date
                                            })}
                                            dateFormat="dd/MM/yyyy"
                                            className='form-control'
                                            disabled={!editingId}
                                        />
                                    </div>
                                    <div className='form-group'>
                                        <label>Nơi cấp:</label>
                                        <input
                                            type='text'
                                            name='issuedPlace'
                                            value={formData.issuedPlace}
                                            onChange={handleInputChange}
                                            disabled={!editingId}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Trạng thái:</label>
                                        <select
                                            name="isActive"
                                            value={formData.isActive}
                                            onChange={handleInputChange}
                                            disabled={!editingId}
                                        >
                                            <option value={true}>Active</option>
                                            <option value={false}>Inactive</option>
                                        </select>
                                    </div>
                                    <div className="form-actions">
                                        {!editingId ? (
                                            <>
                                                <button
                                                    type="button"
                                                    className="edit-button"
                                                    onClick={() => setEditingId(selectedRoute.id)}
                                                >
                                                    Chỉnh sửa
                                                </button>
                                                <button
                                                    type="button"
                                                    className="delete-button"
                                                    onClick={() => {
                                                        setShowDetailModal(false);
                                                        handleDelete(selectedRoute.id);
                                                    }}
                                                >
                                                    Xóa
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <button
                                                    type="button"
                                                    className="cancel-button"
                                                    onClick={() => {
                                                        setEditingId(null);
                                                        setFormData({
                                                            name: selectedRoute.name,
                                                            routeID: selectedRoute.routeID,
                                                            time: selectedRoute.time,
                                                            fromLocation: selectedRoute.fromLocation,
                                                            toLocation: selectedRoute.toLocation,
                                                            issuedDate: new Date(selectedRoute.issuedDate),
                                                            issuedPlace: selectedRoute.issuedPlace,
                                                            isActive: selectedRoute.isActive,
                                                            routeLicense: selectedRoute.routeLicense
                                                        });
                                                    }}
                                                >
                                                    Hủy
                                                </button>
                                                <button
                                                    type="submit"
                                                    className="submit-button"
                                                    disabled={loading}
                                                >
                                                    {loading ? 'Đang xử lý...' : 'Lưu thay đổi'}
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
export default ManageRoute;