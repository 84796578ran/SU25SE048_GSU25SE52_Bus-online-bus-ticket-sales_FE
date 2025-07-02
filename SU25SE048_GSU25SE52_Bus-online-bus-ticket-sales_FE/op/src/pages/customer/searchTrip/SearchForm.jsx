import DatePicker, { registerLocale } from 'react-datepicker';
import '../searchTicket/SearchForm.css';
import { vi } from 'date-fns/locale/vi';
import { useState } from 'react';
import axios from 'axios';
import { environment } from '../../../environment/environment';
registerLocale('vi', vi);
const SearchForm = ({ onSearch }) => {
    const [formData, setFormData] = useState({
        fromLocation: '',
        endLocation: '',
        passengers: '',
        tripType: 'one-way'
    });
    const [startDate, setStartDate] = useState(new Date());
    const [returnDate, setReturnDate] = useState(null);
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };
    const handleTripTypeChange = (type) => {
        setFormData(prev => ({
            ...prev,
            tripType: type
        }));
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        onSearch({ loading: true, data: null, error: null });
        try {
            // Format dữ liệu để gửi đến API
            const searchData = {
                fromLocation: formData.fromLocation,
                toLocation: formData.endLocation,
                date: startDate.toISOString()
            };
            console.log('Searching with data:', searchData);
            const response = await axios.post(`${environment.apiUrl}/Trip/search`, searchData, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            console.log('Search results:', response.data);
            onSearch({
                loading: false,
                data: response.data,
                error: null
            });
        }
        catch (error) {
            console.error('Search error:', error);
            onSearch({
                loading: false,
                error: error.response?.data?.message || error.message || 'Có lỗi xảy ra khi tìm kiếm'
            })
        }
    };
    return (
        <div className="search-form-container">
            <form onSubmit={handleSubmit} className="search-form">
                <div className="trip-type-container">
                    <button type="button"
                        className={`trip-type-button ${formData.tripType === 'one-way' ? 'active' : ''}`}
                        onClick={() => handleTripTypeChange('one-way')}>
                        Một chiều
                    </button>
                    <button
                        type="button"
                        className={`trip-type-button ${formData.tripType === 'round-trip' ? 'active' : ''}`}
                        onClick={() => handleTripTypeChange('round-trip')}
                    >
                        Khứ hồi
                    </button>
                </div>
                <div className="form-group">
                    <label htmlFor="FromLocation">Điểm đi</label>
                    <input
                        type="text"
                        id="departure"
                        name="fromLocation"
                        value={formData.fromLocation}
                        onChange={handleChange}
                        placeholder="Nhập điểm đi"
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="EndLocation">Điểm đến</label>
                    <input
                        type="text"
                        id="destination"
                        name="endLocation"
                        value={formData.endLocation}
                        onChange={handleChange}
                        placeholder="Nhập điểm đến"
                        required
                    />
                </div>
                <div className="form-group date-picker-container">
                    <label htmlFor="date" className="date-picker-label">Ngày đi</label>
                    <DatePicker selected={startDate} onChange={(date) => setStartDate(date)}
                        dateFormat='dd/MM/yyyy' locale='vi' minDate={new Date()} className="date-picker-input"
                        id="date" />
                </div>
                {/* Hiển thị Ngày về chỉ khi là chuyến khứ hồi */}
                {formData.tripType === 'round-trip' && (
                    <div className="form-group date-picker-wrapper">
                        <label htmlFor="returnDate" className="date-picker-label">Ngày về</label>
                        <DatePicker selected={returnDate} onChange={(date) => setReturnDate(date)}
                            dateFormat='dd/MM/yyyy' locale='vi' minDate={startDate} wrapperClassName="date-picker-wrapper"
                            className="date-picker-input" id="returnDate" />
                    </div>
                )}
                {/*
                <div className={`form-group passengers-form-group ${formData.tripType === 'round-trip' ? 'round-trip-adjustment' : ''}`}>
                    <label htmlFor="passengers">Số lượng người</label>
                    <input
                        type="number"
                        id="passengers"
                        name="passengers"
                        value={formData.passengers}
                        onChange={handleChange}
                        min="1" className="passengers-input" required
                    />
                </div>
                */}
                <div className="search-button-container">
                    <button type="submit" className="search-button">Tìm chuyến xe</button>
                </div>
            </form>
        </div>
    )
};
export default SearchForm;