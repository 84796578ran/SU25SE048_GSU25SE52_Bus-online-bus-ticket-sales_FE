import { useCallback, useEffect, useState } from 'react';
import '../tripStation/ManageTripStation.css';
import { environment } from '../../../environment/environment';
const ManageTripStation = () => {
    const [tripStations, setTripStations] = useState([]);
    const [formData, setFormData] = useState({
        tripStationId: '',
        tripId: '',
        stationId: '',
        price: '',
        status: 1,
        pickUpTime: '',
        description: '',
    });
    const [isEditing, setIsEditing] = useState(false);
    const [currentId, setCurrentId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const fetchTripStations = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${environment.apiUrl}/TripStation`);
            if (!response.ok) {
                throw new Error('Lỗi khi tải dữ liệu!');
            }
            const responseData = await response.json(); // Đổi tên biến để tránh nhầm lẫn

            // SỬA LỖI Ở ĐÂY
            // Kiểm tra xem responseData có tồn tại, có thuộc tính 'data' và 'data' có phải là mảng không
            if (responseData && Array.isArray(responseData.data)) {
                setTripStations(responseData.data); // Lấy mảng từ thuộc tính 'data'
            } else {
                // Nếu cấu trúc không như mong đợi, log lỗi và đặt state là mảng rỗng
                console.error("Dữ liệu API trả về không đúng định dạng mong đợi:", responseData);
                setTripStations([]);
            }
        } catch (err) {
            setError(err.message);
            console.error(err);
            setTripStations([]);
        } finally {
            setLoading(false);
        }
    }, []);
    useEffect(() => {
        fetchTripStations();
    }, [fetchTripStations]);
    // Xử lý thay đổi trên form
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };
    // Reset form về trạng thái ban đầu
    const resetForm = () => {
        setIsEditing(false);
        setCurrentId(null);
        setFormData({
            tripStationId: '',
            tripId: '',
            stationId: '',
            price: '',
            status: 1,
            pickUpTime: '',
            description: '',
        });
    };
    // Chuẩn bị cho việc cập nhật (khi nhấn nút Sửa)
    const handleEdit = (station) => {
        setIsEditing(true);
        setCurrentId(station.id); // Lưu lại ID để biết update record nào

        // Chuyển đổi định dạng thời gian ISO từ API thành định dạng `datetime-local` của input
        const localDateTime = station.pickUpTime ? new Date(station.pickUpTime).toISOString().slice(0, 16) : '';

        setFormData({
            tripStationId: station.tripStationId,
            tripId: station.tripId,
            stationId: station.stationId,
            price: station.price,
            status: station.status,
            pickUpTime: localDateTime,
            description: station.description,
        });
        window.scrollTo(0, 0); // Cuộn lên đầu trang để thấy form
    };
    // Tạo mới (Create)
    const handleCreate = async () => {
        // Chuyển đổi thời gian về định dạng ISO string mà API yêu cầu
        const dataToSubmit = {
            ...formData,
            tripId: parseInt(formData.tripId),
            stationId: parseInt(formData.stationId),
            price: parseFloat(formData.price),
            status: parseInt(formData.status),
            pickUpTime: new Date(formData.pickUpTime).toISOString(),
        };
        try {
            const response = await fetch(`${environment.apiUrl}/TripStation`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(dataToSubmit)
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Không thể tạo mới trạm dừng.');
            }
            alert('Tạo mới thành công!');
            resetForm();
            fetchTripStations();
        } catch (err) {
            setError(err.message);
        }
    };
    const handleUpdate = async () => {
        const dataToSubmit = {
            ...formData,
            tripId: parseInt(formData.tripId),
            stationId: parseInt(formData.stationId),
            price: parseFloat(formData.price),
            status: parseInt(formData.status),
            pickUpTime: new Date(formData.pickUpTime).toISOString(),
        };
        try {
            const response = await fetch(`${environment.apiUrl}/TripStation/${currentId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(dataToSubmit)
            });
            if (!response.ok) {
                throw new Error('Không thể cập nhật trạm dừng.');
            }
            alert('Cập nhật thành công!');
            resetForm();
            fetchTripStations(); // Tải lại danh sách
        } catch (err) {
            setError(err.message);
            console.error(err);
        }
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isEditing) {
            await handleUpdate();
        } else {
            await handleCreate();
        }
    }
    // Xóa (delete)
    const handleDelete = async (id) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa trạm dừng này không?')) {
            try {
                const response = await fetch(`${environment.apiUrl}/TripStation/${id}`, {
                    method: 'DELETE'
                });
                if (!response.ok) {
                    throw new Error('Không thể xóa trạm dừng.');
                }
                alert('Xóa thành công!');
                fetchTripStations(); // Tải lại danh sách
            } catch (err) {
                setError(err.message);
                console.error(err);
            }
        }
    }
    return (
        <div className='trip-station-manager'>
            <h1>Quản lý trạm dừng chuyến đi</h1>
            <div className='form-container'>
                <h2>
                    {isEditing ? 'Cập nhật trạm dừng' : 'Thêm trạm dừng'}
                </h2>
                {error && <p className='error-message'>
                    {error}
                </p>}
                <form onSubmit={handleSubmit} className='trip-station-form'>
                    <div className='form-group'>
                        <label>Mã trạm dừng: </label>
                        <input type="text"
                            name="tripStationId"
                            value={formData.tripStationId}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <div className='form-group'>
                        <label>Mã chuyến đi</label>
                        <input type="number"
                            name="tripId"
                            value={formData.tripId}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <div className='form-group'>
                        <label>Mã bến xe</label>
                        <input type="number"
                            name="stationId"
                            value={formData.stationId}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Giá</label>
                        <input type="number"
                            name="price"
                            value={formData.price}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Trạng thái</label>
                        <select name="status" value={formData.status} onChange={handleInputChange}>
                            <option value={1}>Hoạt động</option>
                            <option value={0}>Không hoạt động</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Thời Gian Đón</label>
                        <input type="datetime-local" name="pickUpTime" value={formData.pickUpTime} onChange={handleInputChange} required />
                    </div>
                    <div className="form-group full-width">
                        <label>Mô tả</label>
                        <textarea name="description" value={formData.description} onChange={handleInputChange}></textarea>
                    </div>
                    <div className="form-buttons">
                        <button type="submit" className="btn-submit">{isEditing ? 'Cập nhật' : 'Thêm Mới'}</button>
                        {isEditing && <button type="button" className="btn-cancel" onClick={resetForm}>Hủy</button>}
                    </div>
                </form>
            </div>
            <div className='table-container'>
                {
                    loading ? (
                        <p>Đang tải dữ liệu</p>
                    ) : (
                        <table className='trip-station-table'>
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Mã Trạm Dừng</th>
                                    <th>Mã Chuyến</th>
                                    <th>Mã Bến Xe</th>
                                    <th>Giá</th>
                                    <th>Thời Gian Đón</th>
                                    <th>Trạng thái</th>
                                    <th>Mô tả</th>
                                    <th>Hành Động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {tripStations.map((station) => (
                                    <tr key={station.Id}>
                                        <td>{station.Id}</td>
                                        <td>{station.TripStationId}</td>
                                        <td>{station.TripId}</td>
                                        <td>{station.StationId}</td>
                                        <td>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(station.price)}</td>
                                        <td>{new Date(station.PickUpTime).toLocaleString('vi-VN')}</td>
                                        <td>{station.Status === 1 ? 'Hoạt động' : 'Không hoạt động'}</td>
                                        <td>{station.Description}</td>
                                        <td className="action-buttons">
                                            <button className="btn-edit" onClick={() => handleEdit(station)}>Sửa</button>
                                            <button className="btn-delete" onClick={() => handleDelete(station.Id)}>Xóa</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )
                }
            </div>
        </div>
    )
};
export default ManageTripStation;