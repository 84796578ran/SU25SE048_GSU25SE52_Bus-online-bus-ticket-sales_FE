import React, { useState, useEffect } from 'react';
import StationService from './StationService';

import '../manageStation/ManageStation.css';
import StationForm from './StationForm';

const ManageStation = () => {
    const [stations, setStations] = useState([]);
    const [currentStation, setCurrentStation] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [showDeleted, setShowDeleted] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchStations();
    }, [showDeleted]);

    const fetchStations = async () => {
        setIsLoading(true);
        try {
            const data = await StationService.getAllStations();
            // Filter based on showDeleted status
            const filteredStations = showDeleted
                ? data.filter(station => station.isDeleted)
                : data.filter(station => !station.isDeleted);
            setStations(filteredStations);
            setError(null);
        } catch (err) {
            setError('Failed to fetch stations. Please try again.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddStation = () => {
        setCurrentStation({
            stationId: '',
            name: '',
            locationId: '',
            status: 'active'
        });
        setIsEditing(false);
        document.getElementById('station-form-modal').style.display = 'block';
    };

    const handleEditStation = (station) => {
        setCurrentStation({
            id: station.id,  // Đảm bảo có id
            ...station
        });
        setIsEditing(true);
        document.getElementById('station-form-modal').style.display = 'block';
    };

    const handleDeleteStation = async (id) => {
        if (!id) {
            console.error('No ID provided for deletion');
            setError('No station ID provided for deletion');
            return;
        }
        if (window.confirm('Are you sure you want to delete this station?')) {
            try {
                await StationService.softDeleteStation(id);
                fetchStations();
            } catch (err) {
                setError('Failed to delete station. Please try again.');
                console.error(err);
            }
        }
    };
    const handleSubmit = async (stationData) => {
        try {
            if (isEditing) {
                await StationService.updateStation(currentStation.id, {
                    ...stationData,
                    id: currentStation.id
                });
            } else {
                await StationService.createStation(stationData);
            }
            fetchStations();
            document.getElementById('station-form-modal').style.display = 'none';
        } catch (err) {
            setError(`Failed to ${isEditing ? 'update' : 'create'} station. Please try again.`);
            console.error(err);
        }
    };

    return (
        <div className="manage-station-container">
            <h1>Manage Stations</h1>

            {error && <div className="error-message">{error}</div>}

            <div className="station-controls">
                <button onClick={handleAddStation} className="btn-add">
                    Add New Station
                </button>
            </div>
            {isLoading ? (
                <div className="loading">Loading stations...</div>
            ) : (
                <div className="station-table-container">
                    <table className="station-table">
                        <thead>
                            <tr>
                                <th>Station ID</th>
                                <th>Name</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stations.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="no-data">
                                        {showDeleted ? 'No deleted stations found' : 'No stations found'}
                                    </td>
                                </tr>
                            ) : (
                                stations.map((station) => (
                                    <tr key={station.id} className={station.isDeleted ? 'deleted' : ''}>
                                        <td>{station.stationId}</td>
                                        <td>{station.name}</td>
                                        <td className="actions">

                                            <>
                                                <button
                                                    onClick={() => handleEditStation(station)}
                                                    className="btn-edit"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteStation(station.id)}
                                                    className="btn-delete"
                                                >
                                                    Delete
                                                </button>
                                            </>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            <StationForm
                station={currentStation}
                isEditing={isEditing}
                onSubmit={handleSubmit}
                onClose={() => document.getElementById('station-form-modal').style.display = 'none'}
            />
        </div>
    );
};

export default ManageStation;