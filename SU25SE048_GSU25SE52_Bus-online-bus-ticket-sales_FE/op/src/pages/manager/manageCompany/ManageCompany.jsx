import React, { useState } from 'react';
import CompanyForm from '../../../components/company/CompanyForm';
import CompanyList from '../../../components/company/CompanyList';
import Menu from '../menu/Menu';
import { Button, message } from 'antd';
import '../manageCompany/ManageCompany.css';

const CompanyManagement = () => {
    const [editingCompany, setEditingCompany] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);

    const handleEdit = (company) => {
        setEditingCompany(company);
        setShowForm(true);
    };

    const handleSuccess = () => {
        message.success(editingCompany ? 'Cập nhật công ty thành công' : 'Thêm công ty thành công');
        setShowForm(false);
        setEditingCompany(null);
        setRefreshKey(prev => prev + 1); // Trigger list refresh
    };

    return (
        <div className='page-container'>
            <Menu />
            <div className="company-management">
                <div className="page-header">
                    <h1>Quản lý công ty</h1>
                    {!showForm && (
                        <Button
                            type="primary"
                            onClick={() => setShowForm(true)}
                            className="btn-add"
                        >
                            Thêm công ty mới
                        </Button>
                    )}
                </div>

                {showForm ? (
                    <div className="form-container">
                        <CompanyForm
                            company={editingCompany}
                            onSuccess={handleSuccess}
                            onCancel={() => {
                                setShowForm(false);
                                setEditingCompany(null);
                            }}
                        />
                    </div>
                ) : (
                    <CompanyList
                        key={refreshKey}
                        onEdit={handleEdit}
                    />
                )}
            </div>
        </div>
    );
};
export default CompanyManagement;