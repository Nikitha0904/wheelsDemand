import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form } from 'react-bootstrap';
import axios from 'axios';
import Swal from 'sweetalert2';

const ManageVehicles = () => {
    const [vehicles, setVehicles] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [vehicleNo, setVehicleNo] = useState('');
    const [errors, setErrors] = useState({});
   
    useEffect(() => {
        axios.get('http://localhost:8081/vehicles')
            .then(response => {
                setVehicles(response.data);
            })
            .catch(error => {
                console.error('Error fetching vehicles:', error);
            });
    }, []);

    const handleCloseModal = () => {
        setShowModal(false);
        
        setVehicleNo('');
        setErrors({});
    };

    const handleOpenModal = () => {
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const validationErrors = {};

        if (!vehicleNo.trim()) {
            validationErrors.vehicleNo = 'Vehicle Number is required';
        }

        setErrors(validationErrors);

        if (Object.keys(validationErrors).length === 0) {
            try {
                const formData = {
                    vehicle_no: vehicleNo
                };

                const response = await axios.post('http://localhost:8081/addVehicle', formData);
                console.log('Response:', response.data);
                alert('Vehicle added successfully!');
                handleCloseModal();
            } catch (error) {
                console.error('Error adding vehicle:', error);
                alert('Error adding vehicle');
            }
        }
    };

    const handleDelete = async (vehicleId) => {
        Swal.fire({
            title: 'Are you sure?',
            text: 'You will not be able to recover this vehicle!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await axios.delete(`http://localhost:8081/deleteVehicle/${vehicleId}`);
                    const updatedVehicles = vehicles.filter(vehicle => vehicle.vehicle_id !== vehicleId);
                    setVehicles(updatedVehicles);
                    Swal.fire(
                        'Deleted!',
                        'Vehicle has been deleted.',
                        'success'
                    );
                } catch (error) {
                    console.error('Error deleting vehicle:', error);
                    alert('Error deleting vehicle');
                }
            }
        });
    };

    return (
        <div className="container mt-5">
            <h1>Vehicle Management</h1>
            <Table striped bordered hover>
                <thead>
                    <tr>
                        <th>S.NO</th>
                        <th>Vehicle Number</th>
                        <th>Delete</th>
                    </tr>
                </thead>
                <tbody>
                    {vehicles.map((vehicle, index) => (
                        <tr key={vehicle.vehicle_id}>
                            <td>{index + 1}</td>
                            <td>{vehicle.vehicle_no}</td>
                            <td>
                                <Button variant="danger" onClick={() => handleDelete(vehicle.vehicle_id)}>Delete</Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
            <div className="text-center">
                <Button variant="primary" onClick={handleOpenModal}>Add New Vehicle</Button>
            </div>
            <Modal show={showModal} onHide={handleCloseModal}>
                <Modal.Header closeButton>
                    <Modal.Title>Add Vehicle</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleSubmit}>
                        <Form.Group controlId="vehicleNo">
                            <Form.Label>Vehicle Number</Form.Label>
                            <Form.Control
                                type="text"
                                value={vehicleNo}
                                onChange={(e) => setVehicleNo(e.target.value)}
                                isInvalid={!!errors.vehicleNo}
                            />
                            <Form.Control.Feedback type="invalid">
                                {errors.vehicleNo}
                            </Form.Control.Feedback>
                        </Form.Group>
                        <Button variant="primary" type="submit">
                            Submit
                        </Button>
                    </Form>
                </Modal.Body>
            </Modal>
        </div>
    );
};

export default ManageVehicles;