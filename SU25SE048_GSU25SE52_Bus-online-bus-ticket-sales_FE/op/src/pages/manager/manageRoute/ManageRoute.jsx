import { useEffect, useState } from 'react';
import '../manageRoute/ManageRoute.css';
import { toast } from 'react-toastify';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import Menu from '../menu/Menu';
import { format } from 'date-fns';
import Pagination from '../../../components/pagination/Pagination';
import Footer from '../../../components/footer/Footer';
const ManageRoute = () => {
    const [routes, setRoutes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [companies, setCompanies] = useState([]);
    const [formData, setFormData] = useState({
        fromLocation: '',
        routeId: '',
        companyName: '',
        toLocation: '',
        time: '',
        duration: '',
        distance: '',
        description: '',
        issuedPlace: '',
        createAt: new Date(),
        routeLicense: '',
        isCreate: true,
        companyId: '',
        isDelete: false,
    });
    const [companyFormData, setCompanyFormData] = useState({
        CompanyID: '',
        name: '',
        address: '',
        TaxNumber: ''
    });
    const [showCreateCompanyModal, setShowCreateCompanyModal] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    // Fetch all routes
    useEffect(() => {
        const fetchRoutes = async () => {
            try {
                const response = await axios.get('https://localhost:7197/api/Route/GetAllRoute');
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
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };
    const handleFileChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.files[0]
        });
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        /// Validate required fields
        if (!formData.routeId || !formData.fromLocation || !formData.toLocation || !formData.companyId) {
            toast.error('Vui lòng điền đầy đủ thông tin bắt buộc');
            return;
        }
        console.log('Form data before submit:', formData);

        try {
            const data = new FormData();
            data.append('routeId', formData.routeId);
            data.append('fromLocation', formData.fromLocation);
            data.append('toLocation', formData.toLocation);
            data.append('duration', parseInt(formData.duration));
            data.append('distance', 0); // Giá trị mặc định
            data.append('createAt', formData.createAt);
            data.append('description', formData.description || '');
            data.append('isCreate', true);
            data.append('isDelete', false);
            data.append('companyId', formData.companyId);
            if (formData.routeLicense) {
                data.append('routeLicense', formData.routeLicense);
            }
            data.append('companyName', formData.companyName);
            console.log('Sending form data:', {
                routeId: formData.routeId,
                fromLocation: formData.fromLocation,
                toLocation: formData.toLocation,
                companyId: formData.companyId
            });
            setLoading(true);
            const response = await axios.post(`https://localhost:7197/api/Route/CreateRoute`, data, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            if (response.data) {
                toast.success('Tạo tuyến đường thành công!');
                setRoutes([
                    ...routes,
                    response.data
                ]);
                const updatedResponse = await axios.get('https://localhost:7197/api/Route/GetAllRoute');
                setRoutes(updatedResponse.data);
                setShowCreateModal(false);
                resetFormData();
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
        try {
            if (!dateString) return 'N/A'; // Xử lý trường hợp null/undefined

            const date = new Date(dateString);

            // Kiểm tra nếu date không hợp lệ
            if (isNaN(date.getTime())) {
                console.warn('Invalid date:', dateString);
                return 'N/A';
            }
            return format(date, 'dd/MM/yyyy');
        } catch (error) {
            console.error('Error formatting date:', error, dateString);
            return 'N/A';
        }
    }
    const handleDelete = async (id) => {
        if (window.confirm('Bạn có muốn xóa không?')) {
            try {
                await axios.put(`https://localhost:7197/api/Route/DeleteRoute/${id}`, {
                    isDelete: true
                });
                setRoutes(routes.map(route =>
                    route.id === id ? {
                        ...route,
                        isDelete: true
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
            routeId: route.routeId,
            fromLocation: route.fromLocation,
            toLocation: route.toLocation,
            issuedDate: route.issuedDate ? new Date(route.issuedDate) : new Date(), // Fallback to current date if invalid,
            issuedPlace: route.issuedPlace || '', // Thêm trường này nếu chưa có
            isActive: route.isActive !== undefined ? route.isActive : true // Thêm trường này nếu chưa có
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
        .filter(route => !route.isDelete)
        .slice(indexOfFirstItem, indexOfLastItem);
    const safeDateFormat = (dateString, formatStr = 'dd/MM/yyyy') => {
        try {
            if (!dateString) return 'N/A';
            const date = new Date(dateString);
            return isNaN(date.getTime()) ? 'N/A' : format(date, formatStr);
        } catch (error) {
            console.error('Date formatting error:', error);
            return 'N/A';
        }
    }
    // Tính tổng số trang
    const totalPages = Math.ceil(routes.filter(route => !route.isDelete).length / itemsPerPage);
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
            fromLocation: '',
            toLocation: '',
            RouteLicense: null,
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
                            Tạo tuyến đường
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
                                        <th>Điểm xuất phát</th>
                                        <th>Điểm kết thúc</th>
                                        <th>Ngày cấp</th>
                                    </tr>

                                </thead>
                                <tbody>
                                    {
                                        currentRoutes.filter(route => !route.isDelete).map(route => (
                                            <tr key={route.id}
                                                onClick={() => handleRowClick(route)}
                                                style={{ cursor: 'pointer' }}
                                            >
                                                <td>
                                                    {route.routeId}
                                                </td>
                                                <td>
                                                    {route.fromLocation}
                                                </td>
                                                <td>
                                                    {route.toLocation}
                                                </td>
                                                <td>
                                                    {safeDateFormat(route.createAt)}
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
                                        <input type="text" name="routeId"
                                            value={formData.routeId} onChange={handleInputChange} required />
                                    </div>
                                    <div className="form-group">
                                        <label>Thời gian di chuyển (phút):</label>
                                        <input
                                            type="number"
                                            name="duration"
                                            value={formData.duration}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Điểm bắt đầu/Bến xe khởi hành:</label>
                                        <input
                                            type="text"
                                            name="fromLocation"
                                            value={formData.fromLocation}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Điểm kết thúc/Trạm cuối:</label>
                                        <input
                                            type="text"
                                            name="toLocation"
                                            value={formData.toLocation}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Khoảng cách:</label>
                                        <input
                                            type="text"
                                            name="distance"
                                            value={formData.distance}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Mô tả:</label>
                                        <input
                                            type="text"
                                            name="description"
                                            value={formData.description}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Company ID:</label>
                                        <input
                                            type="text"
                                            name="companyId"
                                            value={formData.companyId}
                                            onChange={handleInputChange}
                                            required
                                        />
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
                                            {loading ? 'Đang xử lý...' : 'Tạo tuyến đường'}
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
                                            name="routeId"
                                            value={formData.routeId}
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
                                                            routeId: selectedRoute.routeId,
                                                            fromLocation: selectedRoute.fromLocation,
                                                            toLocation: selectedRoute.toLocation,
                                                            issuedDate: new Date(selectedRoute.issuedDate),
                                                            issuedPlace: selectedRoute.issuedPlace,
                                                            isActive: selectedRoute.isActive,
                                                            RouteLicense: selectedRoute.RouteLicense
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
                    <div className='manage-route-footer'>
                        <Footer />
                    </div>
                </div>
            </div>
        </div>
    )
}
export default ManageRoute;