import { useEffect, useState } from 'react';
import '../searchTrip/SearchTrip.css';
import Header from '../../../components/header/Header';
import SearchForm from './SearchForm';
import Footer from '../../../components/footer/Footer';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { environment } from '../../../environment/environment';
const SearchTrip = () => {
    const navigate = useNavigate();
    const [locations, setLocations] = useState([]); // Thêm state cho locations
    console.log('Locations data:', locations);
    const [loadingLocations, setLoadingLocations] = useState(true); // Thêm state loading

    useEffect(() => {
        const fetchLocations = async () => {
            try {
                console.log('Fetching locations from:', `${environment.apiUrl}/Location/GetAllLocations`);
                const response = await axios.get(`${environment.apiUrl}/Location/GetAllLocations`);
                // Kiểm tra cấu trúc dữ liệu trả về
                console.log('API Response:', response.data);

                // Giả sử API trả về mảng các đối tượng có trường name
                if (response.data && Array.isArray(response.data)) {
                    setLocations(response.data);
                } else {
                    console.error('Unexpected data format from API');
                    setLocations([]); // Set mảng rỗng nếu dữ liệu không đúng định dạng
                }
                setLoadingLocations(false); // Khi fetch xong
            } catch (error) {
                console.error('Error fetching locations:', error);
                setLoadingLocations(false); // Kể cả khi có lỗi
                setLocations([]);
            }
        };
        fetchLocations();
    }, []);
    // const handleBookTicket = (trips) => {
    //     const tripsArray = Array.isArray(trips) ? trips : [trips];
    //     navigate('/bookTicket', {
    //         state: {
    //             trips: tripsArray,
    //         }
    //     })
    // }
    // Hàm xử lý search chính
    const handleSearch = async (searchData) => {
        try {
            // Đảm bảo định dạng ngày đúng với API yêu cầu
            const formattedSearchData = {
                fromLocation: searchData.fromLocation,
                toLocation: searchData.toLocation,
                date: searchData.date
            };
            const response = await axios.post(`${environment.apiUrl}/Trip/search`, formattedSearchData, {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });

            // Kiểm tra dữ liệu trả về
            console.log('API Response:', response.data);

            if (hasSearchResults(response.data)) {
                navigate('/search-results', {
                    state: {
                        searchResults: response.data,
                    }
                });
            } else {
                console.error('No data returned from API');
                // Xử lý khi không có dữ liệu trả về
            }
        } catch (error) {
            console.error('Search error:', error);
            // Xử lý hiển thị lỗi nếu cần
        }
    };

    // Hàm kiểm tra có kết quả tìm kiếm hay không
    const hasSearchResults = (data) => {
        return (data?.directTrips && data.directTrips.length > 0) ||
            (data?.transferTrips && data.transferTrips.length > 0) ||
            (data?.tripleTrips && data.tripleTrips.length > 0);
    }
    // const formatTime = (dateString) => {
    //     const date = new Date(dateString);
    //     return date.toLocaleTimeString('vi-VN', {
    //         day: '2-digit',
    //         month: '2-digit',
    //         year: 'numeric',
    //         hour: '2-digit',
    //         minute: '2-digit',
    //         hour12: false
    //     })
    // }

    return (
        <div className='home-page-container' style={{ overflowY: 'auto' }}>
            <Header />
            <div className="home-page">
                <div className="hero-content">
                    <h1>Đặt vé xe khách trực tuyến</h1>
                    <SearchForm onSearch={handleSearch} locations={locations} loadingLocations={loadingLocations} />
                </div>
                <div className='search-ticket-footer'>
                    <Footer />
                </div>
            </div>

        </div>
    )
}
export default SearchTrip;