import { useEffect, useState } from "react";
import axios from 'axios';
import '../createTrip/CreateTrip.css';
import DatePicker, { registerLocale } from "react-datepicker";
import { vi } from "date-fns/locale/vi";
import 'react-datepicker/dist/react-datepicker.css';
import { useNavigate, useParams } from "react-router-dom";
import Menu from "../menu/Menu";
import { toast } from "react-toastify";
import Footer from "../../../components/footer/Footer";
import { environment } from "../../../environment/environment";
registerLocale('vi', vi);
const CreateTrip = () => {
    const navigate = useNavigate();
    const [startDate, setStartDate] = useState(null);
    const [dateError, setDateError] = useState('');
    const [endDate, setEndDate] = useState(null);
    const [formData, setFormData] = useState({
        timeStart: '',
        timeEnd: '',
        price: 0,
        routeId: '',
        busId: '',
        description: ''
    });
    // Xử lý khi thay đổi ngày khởi hành
    const handleStartDateChange = (date) => {
        setStartDate(date);
        setFormData(prev => ({
            ...prev,
            timeStart: date.toISOString()
        }));
        validateDates(date, endDate);
    };

    // Xử lý khi thay đổi ngày kết thúc
    const handleEndDateChange = (date) => {
        setEndDate(date);
        setFormData(prev => ({
            ...prev,
            timeEnd: date.toISOString()
        }));
        validateDates(startDate, date);
    };
    const { id } = useParams();
    const [busTypes, setBusTypes] = useState([]);
    const [routes, setRoutes] = useState([]);
    const [filteredRoutes, setFilteredRoutes] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    // Hàm kiểm tra validation ngày
    const validateDates = (start, end) => {
        const now = new Date();
        if (start && start <= now) {
            setDateError('Thời gian khởi hành phải lớn hơn thời gian hiện tại');
            return false;
        }
        if (start && end && end <= start) {
            setDateError('Thời gian kết thúc phải lớn hơn thời gian khởi hành');
            return false;
        }
        setDateError('');
        return true;
    };
    const fetchBusTypes = async () => {
        try {
            const response = await axios.get('https://6842b377e1347494c31da299.mockapi.io/Bustype');
            setBusTypes(response.data);
        } catch (error) {
            toast.error('Failed to load bus types');
            console.error('Error fetching bus types:', error);
        }
    }
    const fetchRoutes = async () => {
        try {
            const response = await axios.get(`${environment.apiUrl}/Route/GetAllRoute`);
            const activeRoutes = response.data.filter(route => !route.isDeleted);
            setRoutes(activeRoutes);
            setFilteredRoutes(activeRoutes);
        } catch (error) {
            toast.error('Failed to load routes');
            console.error('Error fetching routes:', error);
        }
    }
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get('https://683ac9b843bb370a8673bd67.mockapi.io/api/BusRoutes/Route');
                const activeRoutes = response.data.filter(route => !route.isDeleted);
                setRoutes(activeRoutes);
                setFilteredRoutes(activeRoutes);
            } catch (error) {
                toast.error('Failed to load routes');
            }
        };
        fetchData();
    }, []);
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                setIsLoading(true);
                await fetchBusTypes();
                await fetchRoutes();
                if (id) {
                    setIsLoading(true);
                    const tripRes = await axios.get(`${environment.apiUrl}/Trip/GetTripById?id=${id}`);
                    const tripData = tripRes.data;
                    setFormData({
                        ...tripData,
                        routeId: tripData.routeId,
                        busId: tripData.busId
                    });
                    if (tripData.timeStart) setStartDate(new Date(tripData.timeStart));
                    if (tripData.timeEnd) setEndDate(new Date(tripData.timeEnd));
                    setIsEditing(true);
                }
            } catch (err) {
            } finally {
                setIsLoading(false);
            }
        };
        fetchInitialData();
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        // Xử lý riêng cho trường price
        if (name === 'price') {
            // Chỉ cho phép số và không nhỏ hơn 0
            const numericValue = value === '' ? '' : Math.max(0, Number(value));
            setFormData(prev => ({
                ...prev,
                [name]: numericValue
            }));
            return;
        }
        if (name === 'routeId') {
            const selectedRoute = routes.find(route => route.routeId === value);
            if (selectedRoute) {
                setFormData(prev => ({
                    ...prev,
                    routeID: value,
                    fromLocation: selectedRoute.fromLocation,
                    endLocation: selectedRoute.toLocation
                }))
            }
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log('Form data before submission:', {
            ...formData,
            timeStart: startDate,
            timeEnd: endDate
        });
        // Kiểm tra validation trước khi submit
        if (!validateDates(startDate, endDate)) {
            return;
        }
        if (!formData.routeId) {
            toast.error('Vui lòng chọn tuyến đường');
            return;
        }
        if (!formData.busId) {
            toast.error('Vui lòng chọn xe');
            return;
        }
        if (formData.price <= 0) {
            toast.error('Giá phải lớn hơn 0');
            return;
        }
        setIsLoading(true);
        setError(null);
        setSuccess(false);

        try {
            const tripData = {
                timeStart: startDate.toISOString(),
                timeEnd: endDate.toISOString(),
                price: Number(formData.price),
                routeId: formData.routeId,
                busId: formData.busId,
                description: formData.description
            }
            await axios.post(`${environment.apiUrl}/Trip/CreateTrip`, tripData);
            toast.success('Tạo chuyến đi thành công!');
            setSuccess(true);
            // Reset form sau khi tạo thành công
            setFormData({
                timeStart: '',
                timeEnd: '',
                price: 0,
                routeId: '',
                busId: '',
                description: ''
            });
            setStartDate(null);
            setEndDate(null);
        }
        catch (err) {
            setError(err.response?.data?.message || 'Failed to create trip. Please check your inputs.');
        } finally {
            setIsLoading(false);
        }
    };
    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete this trip?')) return;

        setIsLoading(true);
        setError(null);

        try {
            await axios.delete(`${environment.apiUrl}/Trip/DeleteTrip?${id}`);
            setSuccess('Trip deleted successfully!');
            setTimeout(() => {
                navigate('/manageBus'); // Chuyển hướng sau khi xóa
            }, 1500);
        } catch (err) {
            setError('Failed to delete trip. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };
    if (isLoading && !formData.tripId) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p>Loading initial data...</p>
            </div>
        );
    }

    return (
        <div className="create-trip-wrapper">
            <Menu />
            <div className="create-trip-container">
                <div className="create-trip-header">
                    <h2>{isEditing ? 'Chỉnh sửa chuyến xe' : 'Tạo chuyến xe'}</h2>
                </div>

                {error && (
                    <div className="alert alert-error">
                        <svg className="alert-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{error}</span>
                    </div>
                )}

                {success && (
                    <div className="alert alert-success">
                        <svg className="alert-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>Tạo chuyến thành công!</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="trip-form">
                    <div className="form-grid">
                        <div className="form-group">
                            <label htmlFor="routeId">Tuyến đường <span className="required">*</span></label>
                            <select
                                id="routeId"
                                name="routeId"
                                value={formData.routeId}
                                onChange={handleChange}
                            >
                                <option value="">-- Chọn tuyến đường --</option>
                                {filteredRoutes.map(route => (
                                    <option key={route.routeId} value={route.routeId}>
                                        {route.name} ({route.fromLocation} - {route.toLocation})
                                    </option>
                                ))}
                            </select>
                        </div>
                        {/* Trường busId */}
                        <div className="form-group">
                            <label htmlFor="busId">Chọn xe <span className="required">*</span></label>
                            <select
                                id="busId"
                                name="busId"
                                value={formData.busId}
                                onChange={handleChange}
                            >
                                <option value="">-- Chọn xe --</option>
                                {busTypes.map(bus => (
                                    <option key={bus.id} value={bus.id}>
                                        {bus.name} (Số chỗ: {bus.numberOfSeat})
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label htmlFor="timeStart">Thời gian bắt đầu <span className="required">*</span></label>
                            <DatePicker
                                id="timeStart"
                                selected={startDate}
                                onChange={handleStartDateChange}
                                dateFormat="dd/MM/yyyy"
                                locale="vi"
                                className="date-picker-input"
                                required minDate={startDate}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="timeEnd">Thời gian kết thúc <span className="required">*</span></label>
                            <DatePicker
                                id="timeEnd"
                                selected={endDate}
                                onChange={handleEndDateChange}
                                dateFormat="dd/MM/yyyy"
                                locale="vi"
                                className="date-picker-input"
                                required minDate={startDate}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="price">Giá <span className="required">*</span></label>
                            <div className="price-input-container">
                                <input
                                    type="text"
                                    id="price"
                                    name="price"
                                    value={formData.price}
                                    onChange={handleChange}
                                    min="0"
                                    required
                                    onKeyDown={(e) => {
                                        // Ngăn chặn nhập ký tự '-' (âm)
                                        if (e.key === '-' || e.key === 'e') {
                                            e.preventDefault();
                                        }
                                    }}
                                />
                                <span className="price-unit">VND</span>
                            </div>
                            {/* Hiển thị thông báo lỗi nếu có */}
                            {formData.price < 0 && (
                                <small style={{ color: 'var(--error-color)' }}>
                                    Giá không được nhỏ hơn 0
                                </small>
                            )}
                        </div>
                        <div className="form-group full-width">
                            <label htmlFor="description">Mô tả</label>
                            <textarea
                                id="description"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="Additional details about this trip..."
                                rows="3"
                            />
                        </div>
                    </div>

                    <div className="form-actions">
                        {isEditing && (
                            <button
                                type="button"
                                onClick={handleDelete}
                                disabled={isLoading}
                                className="btn delete-btn"
                            >
                                {isLoading ? 'Đang xóa...' : 'Xóa chuyến'}
                            </button>
                        )}
                        <button type="submit" disabled={isLoading} className="btn submit-btn fit-content-btn">
                            {isLoading ? (
                                <>
                                    <span className="spinner-btn"></span>
                                    {isEditing ? 'Đang cập nhật...' : 'Đang tạo...'}
                                </>
                            ) : (
                                isEditing ? 'Cập nhật chuyến đi' : 'Tạo chuyến đi'
                            )}
                        </button>
                    </div>
                </form>
            </div>
            <div className="create-footer">
                <Footer />
            </div>
        </div>
    );
};
export default CreateTrip;