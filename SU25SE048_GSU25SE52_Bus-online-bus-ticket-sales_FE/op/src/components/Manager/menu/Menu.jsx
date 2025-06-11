import React from 'react';
import { Link } from 'react-router-dom';
import './Menu.css';

const Menu = () => {
    return (
        <div className="manager-menu">
            <nav>
                <ul>
                    <li>
                        <Link to="/manager">Tạo chuyến xe</Link>
                    </li>
                    <li>
                        <Link to="/manageRoute">Quản lý tuyến xe</Link>
                    </li>
                    <li>
                        <Link to="/services">Bán vé</Link>
                    </li>
                </ul>
            </nav>
        </div>
    );
};

export default Menu; 