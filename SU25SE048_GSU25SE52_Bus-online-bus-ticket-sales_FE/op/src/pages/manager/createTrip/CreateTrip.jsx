import { useEffect, useState } from "react";
import axios from 'axios';
import '../createTrip/CreateTrip.css';
import DatePicker, { registerLocale } from "react-datepicker";
import { vi } from "date-fns/locale/vi";
import 'react-datepicker/dist/react-datepicker.css';
import Menu from "../../../components/menu/Menu";
registerLocale('vi', vi);
const CreateTrip = () => {
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [formData, setFormData] = useState({
        tripID: '',
        price: '',
        status: 'active',
        timeID: '',
        timeStart: '',
        timeEnd: '',
        description: '',
        typeBusID: '',
        FromLocation: '',
        EndLocation: '',
        routID: ''
    });

    const [busTypes, setBusTypes] = useState([]);
    const [routes, setRoutes] = useState([]);
    const [timeSlots, setTimeSlots] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                setIsLoading(true);
                const [busTypesRes, routesRes, timeSlotsRes] = await Promise.all([
                    axios.get('/api/bus-types'),
                    axios.get('/api/routes'),
                    axios.get('/api/time-slots')
                ]);
                setBusTypes(busTypesRes.data);
                setRoutes(routesRes.data);
                setTimeSlots(timeSlotsRes.data);
            } catch (err) {
                setError('Failed to load initial data. Please try again later.');
            } finally {
                setIsLoading(false);
            }
        };
        fetchInitialData();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        setSuccess(false);

        try {
            const response = await axios.post('https://6842b377e1347494c31da299.mockapi.io/Trip', formData);
            if (response.status === 201) {
                setSuccess(true);
                setFormData({
                    tripID: '',
                    price: '',
                    status: '',
                    timeID: '',
                    timeStart: '',
                    timeEnd: '',
                    description: '',
                    typeBusID: '',
                    FromLocation: '',
                    EndLocation: '',
                    routID: ''
                });
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create trip. Please check your inputs.');
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading && !formData.TripID) {
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
                    <h2>Tạo chuyến xe</h2>
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
                        <span>Trip created successfully!</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="trip-form">
                    <div className="form-grid">
                        <div className="form-group">
                            <label htmlFor="TripID">Trip ID <span className="required">*</span></label>
                            <input
                                type="text"
                                id="TripID"
                                name="TripID"
                                value={formData.TripID}
                                onChange={handleChange}
                                placeholder="Enter unique trip ID"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="price">Giá <span className="required">*</span></label>
                            <div className="input-with-symbol">
                                <input
                                    type="number"
                                    id="price"
                                    name="price"
                                    value={formData.price}
                                    onChange={handleChange}
                                    min="0"
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="status">Trạng thái <span className="required">*</span></label>
                            <div className="select-wrapper">
                                <select
                                    id="status"
                                    name="status"
                                    value={formData.status}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="typeBusID">ID loại xe<span className="required">*</span></label>
                            <div className="select-wrapper">
                                <input
                                    id="typeBusID"
                                    name="typeBusID"
                                    value={formData.typeBusID}
                                    onChange={handleChange}
                                    required
                                >
                                </input>
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="FromLocation">Vị trí bắt đầu <span className="required">*</span></label>
                            <input
                                type="text"
                                id="FromLocation"
                                name="FromLocation"
                                value={formData.FromLocation}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="EndLocation">Vị trí kết thúc <span className="required">*</span></label>
                            <input
                                type="text"
                                id="EndLocation"
                                name="EndLocation"
                                value={formData.EndLocation}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="timeStart">Thời gian khởi hành <span className="required">*</span></label>
                            <DatePicker
                                id="timeStart"
                                selected={startDate}
                                onChange={(date) => {
                                    setStartDate(date);
                                    setFormData(prev => ({
                                        ...prev,
                                        timeStart: date.toISOString()
                                    }));
                                }}
                                dateFormat="dd/MM/yyyy"
                                locale="vi"
                                className="date-picker-input"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="timeEnd">Thời gian kết thúc <span className="required">*</span></label>
                            <DatePicker
                                id="timeEnd"
                                selected={endDate}
                                onChange={(date) => {
                                    setEndDate(date);
                                    setFormData(prev => ({
                                        ...prev,
                                        timeEnd: date.toISOString()
                                    }));
                                }}
                                dateFormat="dd/MM/yyyy"
                                locale="vi"
                                className="date-picker-input"
                                required
                            />
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
                        <button type="submit" disabled={isLoading} className="submit-btn">
                            {isLoading ? (
                                <>
                                    <span className="spinner-btn"></span>
                                    Creating...
                                </>
                            ) : (
                                'Create Trip'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
export default CreateTrip;