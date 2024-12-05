import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form } from 'react-bootstrap';
import axios from 'axios';
import Swal from 'sweetalert2';

const ManageDrivers = () => {
    const [drivers, setDrivers] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [driverName, setDriverName] = useState('');
    const [contactNo, setContactNo] = useState('');
    const [errors, setErrors] = useState({});
   
    useEffect(() => {
        axios.get('http://localhost:8081/drivers')
            .then(response => {
                setDrivers(response.data);
            })
            .catch(error => {
                console.error('Error fetching drivers:', error);
            });
    }, []);

    const handleCloseModal = () => {
        setShowModal(false);
        setDriverName('');
        setContactNo('');
        setErrors({});
    };

    const handleOpenModal = () => {
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const validationErrors = {};

        if (!driverName.trim()) {
            validationErrors.driverName = 'Driver Name is required';
        }

        if (!contactNo.trim()) {
            validationErrors.contactNo = 'Contact Number is required';
        } else if (!/^\d{10}$/.test(contactNo)) {
            validationErrors.contactNo = 'Please enter a valid 10-digit contact number';
        }

        setErrors(validationErrors);

        if (Object.keys(validationErrors).length === 0) {
            try {
                const formData = {
                    driver_name: driverName,
                    contact_no: contactNo
                };

                const response = await axios.post('http://localhost:8081/addDriver', formData);
                console.log('Response:', response.data);
                alert('Driver added successfully!');
                handleCloseModal();
            } catch (error) {
                console.error('Error adding driver:', error);
                alert('Error adding driver');
            }
        }
    };

    const handleDelete = async (driverId) => {
        Swal.fire({
            title: 'Are you sure?',
            text: 'You will not be able to recover this driver!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await axios.delete(`http://localhost:8081/deleteDriver/${driverId}`);
                    const updatedDrivers = drivers.filter(driver => driver.driver_id !== driverId);
                    setDrivers(updatedDrivers);
                    Swal.fire(
                        'Deleted!',
                        'Driver has been deleted.',
                        'success'
                    );
                } catch (error) {
                    console.error('Error deleting driver:', error);
                    alert('Error deleting driver');
                }
            }
        });
    };

    return (
        <div className="container mt-5">
            <h1>Driver Management</h1>
            <Table striped bordered hover>
                <thead>
                    <tr>
                        <th>S.NO</th>
                        <th>Driver Name</th>
                        <th>Contact Number</th>
                        <th>Delete</th>
                    </tr>
                </thead>
                <tbody>
                    {drivers.map((driver, index) => (
                        <tr key={driver.driver_id}>
                            <td>{index + 1}</td>
                            <td>{driver.driver_name}</td>
                            <td>{driver.contact_no}</td>
                            <td>
                                <Button variant="danger" onClick={() => handleDelete(driver.driver_id)}>Delete</Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
            <div className="text-center">
                <Button variant="primary" onClick={handleOpenModal}>Add New Driver</Button>
            </div>
            <Modal show={showModal} onHide={handleCloseModal}>
                <Modal.Header closeButton>
                    <Modal.Title>Add Driver</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleSubmit}>
                        <Form.Group controlId="driverName">
                            <Form.Label>Driver Name</Form.Label>
                            <Form.Control type="text" value={driverName} onChange={(e) => setDriverName(e.target.value)} />
                            {errors.driverName && <Form.Text className="text-danger">{errors.driverName}</Form.Text>}
                        </Form.Group>

                        <Form.Group controlId="contactNo">
                            <Form.Label>Contact Number</Form.Label>
                            <Form.Control type="text" value={contactNo} onChange={(e) => setContactNo(e.target.value)} />
                            {errors.contactNo && <Form.Text className="text-danger">{errors.contactNo}</Form.Text>}
                        </Form.Group>
                         <br></br>
                        <Button variant="primary" type="submit">
                            Submit
                        </Button>
                    </Form>
                </Modal.Body>
            </Modal>
        </div>
    );
};

export default ManageDrivers;