import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useParams, useNavigate } from 'react-router-dom';
import { Form, Button, Row, Col } from 'react-bootstrap';
import axios from 'axios';
import { toast } from 'react-toastify';


const TimeSelector = ({ selectedHour, selectedMinute, selectedPeriod, onHourChange, onMinuteChange, onPeriodChange }) => {
    const hoursOptions = Array.from({ length: 12 }, (_, i) => i + 1);
    const minutesOptions = Array.from({ length: 60 }, (_, i) => i);
    const periods = ['AM', 'PM'];
  
    return (
      <div className="d-flex">
        <select className="form-select me-2" value={selectedHour} onChange={onHourChange}>
          <option value="">Select Hour</option>
          {hoursOptions.map((hour) => (
            <option key={hour} value={hour}>
              {hour}
            </option>
          ))}
        </select>
  
        <select className="form-select me-2" value={selectedMinute} onChange={onMinuteChange}>
          <option value="">Select Minute</option>
          {minutesOptions.map((minute) => (
            <option key={minute} value={minute}>
              {`minute < 10 ? 0${minute} : minute`}
            </option>
          ))}
        </select>
  
        <select className="form-select" value={selectedPeriod} onChange={onPeriodChange}>
          <option value="">Select Period</option>
          {periods.map((period) => (
            <option key={period} value={period}>
              {period}
            </option>
          ))}
        </select>
      </div>
    );
  };
  

const VehicleRequisitionForm = () => {
  const [selectedHour, setSelectedHour] = useState('');
  const [selectedMinute, setSelectedMinute] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('');
  const [colleges, setColleges] = useState([]);
  const [selectedCollege, setSelectedCollege] = useState('');
  const [name, setName] = useState('');
  const [designation, setDesignation] = useState('');
  const [destinationFrom, setDestinationFrom] = useState('');
  const [destinationTo, setDestinationTo] = useState('');
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
        axios.get('http://localhost:8081/colleges')
            .then(response => {
                setColleges(response.data);
            })
            .catch(error => {
                console.error('Error fetching pending requests data:', error);
            });
    }, []);

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

    const handleHourChange = (e) => {
        setSelectedHour(e.target.value);
      };
    
      const handleMinuteChange = (e) => {
        setSelectedMinute(e.target.value);
      };
    
      const handlePeriodChange = (e) => {
        setSelectedPeriod(e.target.value);
      };

      const handleReturnHourChange = (e) => {
        setSelectedReturnHour(e.target.value);
      };
    
      const handleReturnMinuteChange = (e) => {
        setSelectedReturnMinute(e.target.value);
      };
    
      const handleReturnPeriodChange = (e) => {
        setSelectedReturnPeriod(e.target.value);
      };
    
    

    const handleSubmit = async (e) => {
        e.preventDefault();
        const validationErrors = {};

       
        
        if (!/^[A-Za-z\s]+$/.test(name)){
            validationErrors.name = 'Name format is required';
        }
        
        if (!/^[A-Za-z\s]+$/.test(designation))  {
            validationErrors.designation = 'Designation is required';
        }
       
        if (!/^[A-Za-z\s]+$/.test(destinationFrom)){
            validationErrors.destinationFrom = 'Destination From is required';
        }
       
        if (!/^[A-Za-z\s]+$/.test(destinationTo))  {
            validationErrors.destinationTo = 'Destination To is required';
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
            try {
                console.log(vehicleReportingTime);
                const formData = {
                    id: userId,
                    college_id: college_id,
                    guest_mobile_no: guestMobile,
                    status: 'pending',
                    designation,
                    destinationFrom,
                    destinationTo,
                    vehicle_reporting_time: vehicleReportingTime,
                    return_time:expectedReturnTime,
                    date: formatDate(date),
                    place,
                    purpose,
                    request_date: formatDate(getCurrentDate())
                };

                const response = await axios.post('http://localhost:8081/requests', formData);
                toast.success('Form submitted successfully:', response.data);
                navigate(`/facultyDashboard/${userId}/${userName}`);
                setErrors({});

            } catch (error) {
                console.error('Error storing form data:', error);
            }
        } 
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
        navigate(`/facultyDashboard/${userId}/${userName}`);
    };

    return (
        <div className="container mt-5">
            <h2 className="text-center">Vehicle Requisition Form</h2>
            <Form onSubmit={handleSubmit}>

                <Row className="mb-2">
                    <Col>
                        <Form.Group controlId="college">                           
                         <Form.Label>College</Form.Label>
                            <Form.Control as="select" value={selectedCollege} onChange={(e) => setSelectedCollege(e.target.value)}>
                                <option value="">Select College</option>
                                {colleges.map(college => (
                                    <option key={college.college_id} value={college.college_id}>
                                        {college.college_name}
                                    </option>
                                ))}
                            </Form.Control>

                            {errors.college && <Form.Text className="text-danger">{errors.college}</Form.Text>}
                        </Form.Group>
                    </Col>
                    <Col>
                        <Form.Group controlId="name">
                            <Form.Label>Name of Indentor</Form.Label>
                            <Form.Control type="text" value={name} onChange={(e) => setName(e.target.value)} />
                            {errors.name && <Form.Text className="text-danger">{errors.name}</Form.Text>}
                        </Form.Group>
                    </Col>
                </Row>
     
                <Row className="mb-2">
                    <Col>
                        <Form.Group controlId="designation">
                            <Form.Label>Designation</Form.Label>
                            <Form.Control type="text" value={designation} onChange={(e) => setDesignation(e.target.value)} />
                            {errors.designation && <Form.Text className="text-danger">{errors.designation}</Form.Text>}
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
                        <Form.Group controlId="destinationFrom">
                            <Form.Label>Destination From</Form.Label>
                            <Form.Control type="text" value={destinationFrom} onChange={(e) => setDestinationFrom(e.target.value)} />
                            {errors.destinationFrom && <Form.Text className="text-danger">{errors.destinationFrom}</Form.Text>}
                        </Form.Group>
                    </Col>

                    <Col>
                        <Form.Group controlId="destinationTo">
                            <Form.Label>Destination To</Form.Label>
                            <Form.Control type="text" value={destinationTo} onChange={(e) => setDestinationTo(e.target.value)} />
                            {errors.destinationTo && <Form.Text className="text-danger">{errors.destinationTo}</Form.Text>}
                        </Form.Group>
                    </Col>
                </Row>
                
                <Row className="mb-2">
                 <Col>
            <Form.Group controlId="vehicleReportingTime">
              <Form.Label>Vehicle Reporting Time</Form.Label>
              <TimeSelector
                selectedHour={selectedHour}
                selectedMinute={selectedMinute}
                selectedPeriod={selectedPeriod}
                onHourChange={handleHourChange}
                onMinuteChange={handleMinuteChange}
                onPeriodChange={handlePeriodChange}
              />
            </Form.Group>
          </Col>
          
          <Col>
      <Form.Group controlId="expectedReturnTime">
        <Form.Label>Expected Return Time</Form.Label>
        <TimeSelector
          selectedHour={selectedReturnHour}
          selectedMinute={selectedReturnMinute}
          selectedPeriod={selectedReturnPeriod}
          onHourChange={handleReturnHourChange}
          onMinuteChange={handleReturnMinuteChange}
          onPeriodChange={handleReturnPeriodChange}
        />
      </Form.Group>
    </Col>
                    
                </Row>
                <Row className="mb-2">
                <Col>
                        <Form.Group controlId="place">
                            <Form.Label>Place</Form.Label>
                            <Form.Control type="text" value={place} onChange={(e) => setPlace(e.target.value)} />
                            {errors.place && <Form.Text className="text-danger">{errors.place}</Form.Text>}
                        </Form.Group>
                    </Col>
                    <Col>
                    <Form.Group controlId="date">
                        <Form.Label>Date</Form.Label>
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