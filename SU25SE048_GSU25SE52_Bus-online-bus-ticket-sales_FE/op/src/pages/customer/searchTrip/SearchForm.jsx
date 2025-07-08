import DatePicker, { registerLocale } from 'react-datepicker';
import '../searchTrip/SearchForm.css';
import { vi } from 'date-fns/locale/vi';
import { useState } from 'react';
registerLocale('vi', vi);
const SearchForm = ({ onSearch, locations, loadingLocations }) => {
    const [formData, setFormData] = useState({
        fromLocation: '',
        toLocation: '',
        passengers: '',
        tripType: 'one-way',
        pickUp: '',
        dropOff: ''
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
                toLocation: formData.toLocation,
                date: startDate.toISOString()
            };
            console.log('Searching with data:', searchData);
            console.log('Search data:', searchData);
            await onSearch(searchData); // Gọi hàm handleSearch từ SearchTrip
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
                <select id='FromLocation'
                    name="fromLocation"
                    value={formData.fromLocation}
                    onChange={handleChange}
                    required
                    className="location-select"
                >
                    <option value="">Chọn điểm đi</option>
                    {loadingLocations ? (
                        <option disabled>Đang tải dữ liệu...</option>
                    ) : (
                        locations && locations.length > 0 ? (
                            locations.map(location => (
                                <option key={location.id} value={location.name}>
                                    {location.name}
                                </option>
                            ))
                        ) : (
                            <option disabled>Không có dữ liệu địa điểm</option>
                        )
                    )}
                </select>
            </div>
            <div className="form-group">
                <label htmlFor="EndLocation">Điểm đến</label>
                <select
                    id="EndLocation"
                    name="toLocation"
                    value={formData.toLocation}
                    onChange={handleChange}
                    required
                    className="location-select"
                >
                    <option value="">Chọn điểm đến</option>
                    {loadingLocations ? (
                        <option disabled>Đang tải dữ liệu...</option>
                    ) : (
                        locations && locations.length > 0 ? (
                            locations.map(location => (
                                <option key={location.id} value={location.name}>
                                    {location.name}
                                </option>
                            ))
                        ) : (
                            <option disabled>Không có dữ liệu địa điểm</option>
                        )
                    )}
                </select>
            </div>
            <div className="form-group date-picker-container">
                <label htmlFor="date" className="date-picker-label">Ngày đi</label>
                <DatePicker selected={startDate} onChange={(date) => setStartDate(date)}
                    dateFormat='dd/MM/yyyy' locale='vi' minDate={new Date()} className="date-picker-input"
                    id="date"
                />
            </div>
            {/* Hiển thị Ngày về chỉ khi là chuyến khứ hồi */}
            {formData.tripType === 'round-trip' && (
                <div className="form-group date-picker-wrapper">
                    <label htmlFor="returnDate" className="date-picker-label">Ngày về</label>
                    <DatePicker selected={returnDate} onChange={(date) => setReturnDate(date)}
                        dateFormat='dd/MM/yyyy' locale='vi' minDate={startDate} wrapperClassName="date-picker-wrapper"
                        className="date-picker-input" id="returnDate"
                        timeIntervals={15}
                        timeCaption="Thời gian" />
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

    )
};
export default SearchForm;