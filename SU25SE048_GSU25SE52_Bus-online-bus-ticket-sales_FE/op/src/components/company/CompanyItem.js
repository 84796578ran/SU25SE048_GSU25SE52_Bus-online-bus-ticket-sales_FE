import React from 'react';

const CompanyItem = ({ company, onEdit, onDelete }) => {
    return (
        <tr>
            <td>{company.name}</td>
            <td>{company.phone}</td>
            <td>{company.address}</td>
            <td>{company.status ? 'Hoạt động' : 'Ngừng hoạt động'}</td>
            <td className="actions">
                <button onClick={() => onEdit(company)} className="btn-edit">Sửa</button>
                <button onClick={() => onDelete(company.id)} className="btn-delete">Xóa</button>
            </td>
        </tr>
    );
};
export default CompanyItem;