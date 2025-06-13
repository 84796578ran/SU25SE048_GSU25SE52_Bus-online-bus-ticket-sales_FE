import { Link } from "react-router-dom"
import '../menu/Menu.css';
const Menu = () => {
    return (
        <div className="menu-container">
            <div className="menu-header">
                <img src='Logo.png'
                    className="menu-logo" />
            </div>
            <ul className="menu-list">
                <li className="menu-item">
                    <Link to="/stats">
                        <i className="fas fa-chart-bar"></i>
                        Thống kê</Link>
                </li>
                <li className="menu-item">
                    <Link to="/search">
                        <i className="fas fa-search"></i>
                        Tìm kiếm</Link>
                </li>
                <li className="menu-item">
                    <Link to="/manageRoute">
                        <i className="fas fa-route"></i>
                        Quản lý tuyến đường</Link>
                </li>
                <li className="menu-item">
                    <Link to="/manager">
                        <i className="fas fa-bus"></i>
                        Quản lý chuyến xe</Link>
                </li>
                <li className="menu-item">
                    <Link to="/manageUser">
                        <i className="fas fa-users"></i>
                        Quản lý người dùng</Link>
                </li>
            </ul>
        </div>
    )
}
export default Menu;