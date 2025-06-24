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
registerLocale('vi', vi);
const CreateTrip = () => {
    const navigate = useNavigate();
    const [startDate, setStartDate] = useState(null);
    const [dateError, setDateError] = useState('');
    const [endDate, setEndDate] = useState(null);
    const [formData, setFormData] = useState({
        tripId: '',
        price: '',
        status: 0,
        timeId: '',
        timeStart: '',
        timeEnd: '',
        description: '',
        typeBusID: '',
        fromLocation: '',
        endLocation: '',
        routeId: ''
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
    const [selectedRoute, setSelectedRoute] = useState(null);
    const [timeSlots, setTimeSlots] = useState([]);
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
            const response = await axios.get('https://683ac9b843bb370a8673bd67.mockapi.io/api/BusRoutes/Route');
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
                    const tripRes = await axios.get(`https://localhost:7197/api/Trip/${id}`);
                    const tripData = tripRes.data;
                    // Tìm route tương ứng để hiển thị thông tin
                    const route = routes.find(r => r.routeId === tripData.routeId);
                    setFormData({
                        tripId: tripData.tripID,
                        price: tripData.price,
                        status: tripData.status,
                        timeId: tripData.timeId,
                        timeStart: tripData.timeStart,
                        timeEnd: tripData.timeEnd,
                        description: tripData.description,
                        TypeBusID: tripData.TypeBusID,
                        fromLocation: route?.fromLocation || tripData.fromLocation,
                        endLocation: route?.toLocation || tripData.endLocation,
                        routeID: tripData.routeID
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
        if (name === 'routeID') {
            const selectedRoute = routes.find(route => route.routeID === value);
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
        // Kiểm tra validation trước khi submit
        if (!validateDates(startDate, endDate)) {
            return;
        }
        if (!formData.routeID) {
            toast.error('Vui lòng chọn tuyến đường');
            return;
        }
        setIsLoading(true);
        setError(null);
        setSuccess(false);

        try {
            const tripData = {
                ...formData,
                // Đảm bảo các trường dữ liệu cần thiết
                status: formData.status || 'active',
                timeStart: startDate.toISOString(),
                timeEnd: endDate.toISOString()
            }
            if (isEditing) {
                // Cập nhật chuyến đi hiện có
                await axios.put(`https://68366847664e72d28e40a9cf.mockapi.io/api/SearchTickets/Trip/${id}`, formData);
                setSuccess('Trip updated successfully!');
            } else {
                await axios.post('https://localhost:7197/api/Trip/CreateTrip', formData);
                if (!isEditing) {
                    setSuccess(true);
                    setFormData({
                        tripId: '',
                        price: '',
                        status: '',
                        timeId: '',
                        timeStart: '',
                        timeEnd: '',
                        description: '',
                        TypeBusID: '',
                        fromLocation: '',
                        endLocation: '',
                        routeID: ''
                    });
                }
            }
        } catch (err) {
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
            await axios.delete(`https://68366847664e72d28e40a9cf.mockapi.io/api/SearchTickets/Trip/${id}`);
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
                            <label htmlFor="routeID">Tuyến đường <span className="required">*</span></label>
                            <select
                                id="routeID"
                                name="routeID"
                                value={formData.routeID}
                                onChange={handleChange}
                                required
                            >
                                <option value="">-- Chọn tuyến đường --</option>
                                {filteredRoutes.map(route => (
                                    <option key={route.routeID} value={route.routeID}>
                                        {route.name} ({route.fromLocation} - {route.toLocation})
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label htmlFor="fromLocation">Vị trí bắt đầu <span className="required">*</span></label>
                            <input
                                type="text"
                                id="fromLocation"
                                name="fromLocation"
                                value={formData.fromLocation}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="endLocation">Vị trí kết thúc <span className="required">*</span></label>
                            <input
                                type="text"
                                id="endLocation"
                                name="endLocation"
                                value={formData.endLocation}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="timeStart">Thời gian khởi hành <span className="required">*</span></label>
                            <DatePicker
                                id="timeStart"
                                selected={startDate}
                                onChange={handleStartDateChange}
                                dateFormat="dd/MM/yyyy"
                                locale="vi"
                                className="date-picker-input"
                                required minDate={new Date()}
                            />
                            {dateError && (
                                <div className="error-message" style={{ color: 'var(--error-color)', fontSize: '0.8rem', marginTop: '0.5rem' }}>
                                    {dateError}
                                </div>
                            )}
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
                        <div className="form-group">
                            <label htmlFor="typeBusID">Chọn xe<span className="required">*</span></label>
                            <div className="select-wrapper">
                                <select id="typeBusID" name="typeBusID" value={formData.typeBusID}
                                    onChange={handleChange} required>
                                    <option value="">-- Chọn loại xe --</option>
                                    {busTypes.map(bus => (
                                        <option key={bus.id} value={bus.id}>
                                            {bus.name} (Số chỗ: {bus.numberOfSeat})
                                        </option>
                                    ))}
                                </select>
                            </div>
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