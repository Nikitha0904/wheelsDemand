import React, { useState, useEffect } from "react";
import { Button, Form, Container } from "react-bootstrap";
import { useParams, useNavigate } from 'react-router-dom';

import axios from 'axios';
import Swal from 'sweetalert2';

function VehicleDriverAllocation({ selectedRequest }) {
    const { userId, userName, college_id } = useParams();
    const { request_id} = useParams();
  const [selectedDriver, setSelectedDriver] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get(`http://localhost:8081/vehicles/${request_id}`)
      .then(response => {
        setVehicles(response.data);
      })
      .catch(error => {
        console.error('Error fetching vehicles:', error);
      });

    axios.get(`http://localhost:8081/drivers/${request_id}`)
      .then(response => {
        setDrivers(response.data);
      })
      .catch(error => {
        console.error('Error fetching drivers:', error);
      });
  }, [request_id]);

  const handleAllocationSubmit = () => {
    Swal.fire({
      title: 'Confirm Allocation',
      text: 'Are you sure you want to allocate the selected vehicle and driver?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, allocate it!'
    }).then((result) => {
      if (result.isConfirmed) {
        axios.post('http://localhost:8081/allocate-vehicle-driver', {
          requestId: request_id,
          driverId: selectedDriver,
          vehicleId: selectedVehicle,
          status: 'pending'
        })
          .then(response => {
            console.log('Allocation successful:', response.data);
            Swal.fire(
              'Allocated!',
              'Vehicle and driver have been allocated successfully.',
              'success'
            );
            axios.put(`http://localhost:8081/update-request-status/${request_id}`, {
              status: 'approved'
            })
              .then(response => {
                console.log('Request status updated to approved');
                navigate(`/adminDashboard/${userId}/${userName}/${college_id}`);
              })
              .catch(error => {
                console.error('Error updating request status:', error);
                Swal.fire(
                  'Error!',
                  'Failed to update request status. Please try again later.',
                  'error'
                );
              });
          })
          .catch(error => {
            console.error('Error allocating vehicle and driver:', error);
            Swal.fire(
              'Error!',
              'Failed to allocate vehicle and driver. Please try again later.',
              'error'
            );
          });
      }
    });
  };
  
  

  return (
    <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
      <div>
        <h2 className="text-center mb-4">Allocate Vehicle and Driver</h2>
        <Form>
          <Form.Group controlId="vehicleNumber" className="mt-3">
            <Form.Label >Vehicle Number</Form.Label>
            <Form.Control as="select" onChange={(e) => setSelectedVehicle(e.target.value)}>
  <option>Select Vehicle</option>
  {vehicles.map(vehicle => (
    <option key={vehicle.vehicle_id} value={vehicle.vehicle_id}>{vehicle.vehicle_no}</option>
  ))}
</Form.Control>


          </Form.Group>
          


          <Form.Group controlId="driverName" className="mt-3">
            <Form.Label>Driver Name</Form.Label>
           
<Form.Control as="select" onChange={(e) => setSelectedDriver(e.target.value)}>
  <option>Select Driver</option>
  {drivers.map(driver => (
    <option key={driver.driver_id} value={driver.driver_id}>{driver.driver_name}</option>
  ))}
</Form.Control>
          </Form.Group>
          <Button variant="primary" className="mt-3 d-block mx-auto" onClick={handleAllocationSubmit}>Allocate</Button>

        </Form>
      </div>
    </Container>
  );
}

export default VehicleDriverAllocation;
