import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useParams, useNavigate } from 'react-router-dom';
import { Form, Button, Row, Col } from 'react-bootstrap';
import axios from 'axios';


const TimeSelector = ({ selectedTime, onTimeChange }) => {
  const generateTimeOptions = () => {
    const times = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        const formattedHour = (hour % 12 || 12).toString().padStart(2, '0');
        const formattedMinute = minute.toString().padStart(2, '0');
        const period = hour < 12 ? 'AM' : 'PM';
        times.push(`${formattedHour}:${formattedMinute} ${period}`);
      }
    }
    return times;
  };

  const handleTimeChange = (e) => {
    onTimeChange(e.target.value);
  };

  return (
    <select className="form-select" value={selectedTime} onChange={handleTimeChange}>
      <option value="">Select Time</option>
      {generateTimeOptions().map((time, index) => (
        <option key={index} value={time}>
          {time}
        </option>
      ))}
    </select>
  );
};


const VehicleRequisitionForm = () => {
  const [selectedHour, setSelectedHour] = useState('');
  const [selectedMinute, setSelectedMinute] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('');
  const [guestName, setguestName] = useState('');
  const [guestEmail, setguestEmail] = useState('');
  const [guestPickup, setguestPickup] = useState('');
  const [date, setDate] = useState('');
  const [place, setPlace] = useState('');
  const [purpose, setPurpose] = useState('');
  const [guestMobile, setGuestMobile] = useState('');
  const [numPeople, setNumPeople] = useState('');
  const { userId, userName, college_id } = useParams();
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  
  const [selectedReturnHour, setSelectedReturnHour] = useState('');
  const [selectedReturnMinute, setSelectedReturnMinute] = useState('');
  const [selectedReturnPeriod, setSelectedReturnPeriod] = useState('');
  const [expectedReturnTime, setExpectedReturnTime] = useState('');
  const [vehicleReportingTime, setVehicleReportingTime] = useState('');


  

    useEffect(() => {
        if (selectedHour !== '' && selectedMinute !== '' && selectedPeriod !== '') {
          setVehicleReportingTime(`${selectedHour}:${selectedMinute} ${selectedPeriod}`);
        }
      }, [selectedHour, selectedMinute, selectedPeriod]);

      useEffect(() => {
        if (selectedReturnHour !== '' && selectedReturnMinute !== '' && selectedReturnPeriod !== '') {
          setExpectedReturnTime(`${selectedReturnHour}:${selectedReturnMinute} ${selectedReturnPeriod}`);
        }
      }, [selectedReturnHour, selectedReturnMinute, selectedReturnPeriod]);

    const formatDate = (inputDate) => {
        const parts = inputDate.split('-');
        return `${parts[2]}-${parts[1]}-${parts[0]}`;
    };

   
    
    

    const handleSubmit = (e) => {
        e.preventDefault();
        const validationErrors = {};

       
        
        
        if (!/^[A-Za-z\s]+$/.test(guestName))  {
            validationErrors.guestName = 'guestName is required';
        }
       
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(guestEmail)) {
            validationErrors.guestEmail = 'Invalid email address';
        }

        
       
        if (!/^[A-Za-z\s]+$/.test(guestPickup))  {
            validationErrors.guestPickup = 'Destination To is required';
        }
         
        // if (!vehicleReportingTime.trim()) {
        //     validationErrors.vehicleReportingTime = 'Time is required';
        // }
        
        if (!date.trim()) {
            validationErrors.date = 'Date is required';
        }
      
        if (!place.trim()) {
            validationErrors.place = 'Place is required';
        }
        
        if (!purpose.trim()) {
            validationErrors.purpose = 'Purpose is required';
        }
       
        if (!guestMobile.trim()) {
            validationErrors.guestMobile = 'Guest Mobile Number is required';

        } else if (!/^\d{10}$/.test(guestMobile)) {
            validationErrors.guestMobile = 'Please enter a valid 10-digit mobile number';
        }
        
        if (!numPeople.trim()) {
            validationErrors.numPeople = 'Number of People is required';
        } else if (!/^[1-9][0-9]*$/.test(numPeople)) {
            validationErrors.numPeople = 'Please enter a valid number of people';
        }

        setErrors(validationErrors);

        if (Object.keys(validationErrors).length === 0) {
            const formData = {
                id: userId,
                college_id: college_id,
                guest_mobile_no: guestMobile,
                status: 'pending',
                guest_name: guestName,
                guest_email: guestEmail,
                pickup_point: guestPickup,
                vehicle_reporting_time: vehicleReportingTime,
                return_time:expectedReturnTime,
                date: formatDate(date),
                place,
                purpose,
                request_date: formatDate(getCurrentDate())
            };

            axios.post('http://localhost:8081/requests', formData)
                .then(response => {

                    if (response.status === 200) {
                        clearForm();
                        alert('Form submitted successfully');
                        
                        navigate(`/facultyDashboard/${userId}/${userName}/${college_id}`);
                    } else {
                        throw new Error('Failed to submit form');
                    }
                })
                .catch(error => {
                    console.error('Error storing form data:', error);
                    alert('Failed to submit form. Please try again later.');
                });
        } else {
            alert('Please fill in all required fields correctly.');
        }
    };
  
  const clearForm = () => {
    
      setguestName('');
      setguestEmail('');
      setguestPickup('');
      setDate('');
      setPlace('');
      setPurpose('');
      setGuestMobile('');
      setNumPeople('');
      setSelectedHour('');
      setSelectedMinute('');
      setSelectedPeriod('');
      setSelectedReturnHour('');
      setSelectedReturnMinute('');
      setSelectedReturnPeriod('');
      setVehicleReportingTime('');
      setExpectedReturnTime('');
      setErrors({});
  };


    const getCurrentDate = () => {
        const today = new Date();
        const year = today.getFullYear();
        let month = today.getMonth() + 1;
        let day = today.getDate();
    
        month = month < 10 ? '0' + month : month;
        day = day < 10 ? '0' + day : day;
    
        return `${year}-${month}-${day}`;
    };

    const goBack = () => {
        navigate(`/facultyDashboard/${userId}/${userName}/${college_id}`);
    };

    return (
        <div className="container mt-5">
            <h2 className="text-center">Vehicle Requisition Form</h2>
            <Form onSubmit={handleSubmit}>

               
     
                <Row className="mb-2">
                    <Col>
                        <Form.Group controlId="Guest Name">
                            <Form.Label>Guest Name</Form.Label>
                            <Form.Control type="text" value={guestName} onChange={(e) => setguestName(e.target.value)} />
                            {errors.guestName && <Form.Text className="text-danger">{errors.guestName}</Form.Text>}
                        </Form.Group>
                    </Col>
                    <Col>
                        <Form.Group controlId="guestMobile">
                            <Form.Label>Guest Mobile Number</Form.Label>
                            <Form.Control type="text" value={guestMobile} onChange={(e) => setGuestMobile(e.target.value)} />
                            {errors.guestMobile && <Form.Text className="text-danger">{errors.guestMobile}</Form.Text>}
                        </Form.Group>
                    </Col>
                </Row>
                <Row className="mb-2">
                    <Col>
                        <Form.Group controlId="guestEmail">
                            <Form.Label>Guest Email</Form.Label>
                            <Form.Control type="email" value={guestEmail} onChange={(e) => setguestEmail(e.target.value)} />
                            {errors.guestEmail && <Form.Text className="text-danger">{errors.guestEmail}</Form.Text>}
                        </Form.Group>
                    </Col>



                    <Col>
                        <Form.Group controlId="guestPickup">
                            <Form.Label>Guest Pickup Point</Form.Label>
                            <Form.Control type="text" value={guestPickup} onChange={(e) => setguestPickup(e.target.value)} />
                            {errors.guestPickup && <Form.Text className="text-danger">{errors.guestPickup}</Form.Text>}
                        </Form.Group>
                    </Col>
                </Row>
                
                <Row className="mb-2">
                <Col>
    <Form.Group controlId="vehicleReportingTime">
      <Form.Label>Vehicle Reporting Time</Form.Label>
      <TimeSelector
        selectedTime={`${selectedHour}:${selectedMinute} ${selectedPeriod}`}
        onTimeChange={(time) => {
          const [hour, minute, period] = time.split(/[:\s]+/);
          setSelectedHour(hour);
          setSelectedMinute(minute);
          setSelectedPeriod(period);
        }}
      />
    </Form.Group>
  </Col>

          
  <Col>
    <Form.Group controlId="expectedReturnTime">
      <Form.Label>Expected Return Time</Form.Label>
      <TimeSelector
        selectedTime={`${selectedReturnHour}:${selectedReturnMinute} ${selectedReturnPeriod}`}
        onTimeChange={(time) => {
          const [hour, minute, period] = time.split(/[:\s]+/);
          setSelectedReturnHour(hour);
          setSelectedReturnMinute(minute);
          setSelectedReturnPeriod(period);
        }}
      />
    </Form.Group>
  </Col>
                    
                </Row>
                <Row className="mb-2">
                <Col>
                        <Form.Group controlId="place">
                            <Form.Label>Vehicle Reporting Place</Form.Label>
                            <Form.Control type="text" value={place} onChange={(e) => setPlace(e.target.value)} />
                            {errors.place && <Form.Text className="text-danger">{errors.place}</Form.Text>}
                        </Form.Group>
                    </Col>
                    <Col>
                    <Form.Group controlId="date">
                        <Form.Label>Date of Journey</Form.Label>
                        <Form.Control type="date" value={date} min={getCurrentDate()} onChange={(e) => setDate(e.target.value)} />
                        {errors.date && <Form.Text className="text-danger">{errors.date}</Form.Text>}
                    </Form.Group>

                    </Col>
                   
                </Row>
               <Row>
               <Col>
                        <Form.Group controlId="numPeople">
                            <Form.Label>Number of People</Form.Label>
                            <Form.Control type="number" value={numPeople} onChange={(e) => setNumPeople(e.target.value)} />
                            {errors.numPeople && <Form.Text className="text-danger">{errors.numPeople}</Form.Text>}
                        </Form.Group>
                    </Col>
                    <Col>
                <Form.Group controlId="purpose" className="mb-2">
                    <Form.Label>Purpose</Form.Label>
                    <Form.Control type="text" value={purpose} onChange={(e) => setPurpose(e.target.value)} />
                    {errors.purpose && <Form.Text className="text-danger">{errors.purpose}</Form.Text>}
                </Form.Group>
                </Col>
               </Row>
                <div className="text-center">
                    <Button variant="success" type="submit" className="me-5" >
                        Submit
                    </Button>
                    <Button variant="primary" onClick={goBack}>
                        Back
                    </Button>
                </div>
            </Form>
        </div>
    );
};

export default VehicleRequisitionForm;



