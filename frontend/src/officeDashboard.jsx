import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from 'react-router-dom';
import { Navbar, Nav, Button, Container, Row, Col, Table, Modal } from "react-bootstrap";
import Swal from 'sweetalert2';
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';
import { FaEye } from 'react-icons/fa';


function OfficeDashboard() {
  const { userName, college_id} = useParams();
  const [dashboardData, setDashboardData] = useState({});
  const [pendingRequests, setPendingRequests] = useState([]);
  const [approvedRequests, setApprovedRequests] = useState([]);
  const [rejectedRequests, setRejectedRequests] = useState([]);
  const [currentView, setCurrentView] = useState('pending');
  const navigate = useNavigate();
  const [selectedRequest, setSelectedRequest] = useState(null); // State to hold the selected request for modal display

  useEffect(() => {
    axios.get(`http://localhost:8081/officedashboard/${college_id}`)
      .then(response => {
        setDashboardData(response.data);
      })
      .catch(error => {
        console.error('Error fetching dashboard data:', error);
      });

    axios.get(`http://localhost:8081/officepending-requests/${college_id}`)
      .then(response => {
        setPendingRequests(response.data);
      })
      .catch(error => {
        console.error('Error fetching pending requests data:', error);
      });

    axios.get(`http://localhost:8081/officeapproved-requests/${college_id}`)
      .then(response => {
        setApprovedRequests(response.data);
      })
      .catch(error => {
        console.error('Error fetching approved requests data:', error);
      });

    axios.get(`http://localhost:8081/officerejected-requests/${college_id}`)
      .then(response => {
        setRejectedRequests(response.data);
      })
      .catch(error => {
        console.error('Error fetching rejected requests data:', error);
      });
  }, [college_id]);

  const handleApprovedRequestsClick = () => {
    setCurrentView('approved');
  };

  const handleRejectedRequestsClick = () => {
    setCurrentView('rejected');
  };

  const handlePendingRequestsClick = () => {
    setCurrentView('pending');
  };

  const handleLogout = () => {
    navigate(`/login`);
  }

  const handleViewRequestDetails = (request) => {
    setSelectedRequest(request);
  };

  const handleCloseModal = () => {
    setSelectedRequest(null);
  };

  const handleAcceptRequest = (request_id) => {
    Swal.fire({
      title: 'Are you sure?',
      text: 'Are you sure you want to approve this request?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'No',
    }).then((result) => {
      if (result.isConfirmed) {
        axios.put(`http://localhost:8081/update-request-status/${request_id}`, { status: 'approved by office' })
          .then(response => {
            axios.get(`http://localhost:8081/officepending-requests/${college_id}`)
              .then(updatedResponse => {
                setPendingRequests(updatedResponse.data);
              })
              .catch(error => {
                console.error('Error fetching updated pending requests data:', error);
              });
          })
          .catch(error => {
            console.error('Error updating request status:', error);
          });
      }
    });
  };
  
  const handleRejectRequest = (request_id) => {
    Swal.fire({
      title: 'Enter reason for rejection',
      input: 'text',
      showCancelButton: true,
      confirmButtonText: 'Reject',
      cancelButtonText: 'Cancel',
      inputValidator: (value) => {
        if (!value) {
          return 'You need to enter a reason!';
        }
      }
    }).then((result) => {
      if (result.isConfirmed) {
        axios.put(`http://localhost:8081/update-reject-status/${request_id}`, { status: 'rejected', reason: result.value })
          .then(response => {
            axios.get(`http://localhost:8081/officepending-requests/${college_id}`)
              .then(updatedResponse => {
                setPendingRequests(updatedResponse.data); 
              })
              .catch(error => {
                console.error('Error fetching updated rejected requests data:', error);
              });
          })
          .catch(error => {
            console.error('Error updating request status:', error);
          });
      }
    });
  };

  return (
    <div style={{ backgroundColor: '#B4B4B3', minHeight: '100vh' , overflow: 'hidden'}}>
      <Navbar expand="lg" className="mb-3" style={{ backgroundColor: '#61677A', height: '4rem' }}>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav" className="justify-content-end">
          <Nav className="mr-auto">
            <Nav.Link href="#dashboard" className="me-4" style={{ color: 'white', fontSize: '1.2rem', fontWeight: 'bold' }}>Dashboard</Nav.Link>
            <Nav.Link href="#notifications" className="me-4" style={{ color: 'white', fontSize: '1.2rem', fontWeight: 'bold' }}>Notifications</Nav.Link>
          </Nav>
          <Button variant="outline-light" className="me-5" onClick={handleLogout}>Logout</Button>
        </Navbar.Collapse>
      </Navbar>
      <div className="d-flex justify-content-between mt-3">
        <h2 className="mx-3" style={{ fontSize: '3.5rem' }}>Welcome {userName}</h2>
      </div>

      <Container fluid className="mt-3">
        <Row>
          <Col md={3} className="mb-3">
            <div style={{ backgroundColor: '#D8D9DA', padding: '1rem', height: '35rem' }}>
              <h5 className="mb-3">Request Details</h5>
              
              <button className="btn btn-success d-flex align-items-center justify-content-between mt-3 w-100" onClick={handlePendingRequestsClick}>
                <p className="me-5" style={{ fontSize: '1.5rem' }}>Pending Requests</p>
                <p style={{ fontSize: '1.5rem' }}>{dashboardData.pendingRequests}</p>
              </button>

              <button className="btn btn-success d-flex align-items-center justify-content-between mt-3 w-100" onClick={handleApprovedRequestsClick}>
                <p className="me-5" style={{ fontSize: '1.5rem' }}>Approved Requests</p>
                <p style={{ fontSize: '1.5rem' }}>{dashboardData.approvedRequests}</p>
              </button>

              <button className="btn btn-success d-flex align-items-center justify-content-between mt-3 w-100" onClick={handleRejectedRequestsClick}>
                 <p className="me-5" style={{fontSize: '1.5rem'}}>Rejected Requests</p>
                 <p style={{fontSize: '1.5rem'}} >{dashboardData.rejectedRequests}</p>
              </button>

            </div>
          </Col>

          <Col md={9}>
            <div style={{ backgroundColor: '#D8D9DA', padding: '1rem', height: '35rem', overflowY: 'auto' }}>
              {currentView === 'pending' && (
                <div>
                  <h5 className="mb-3">Pending Requests Table</h5>
                  <div style={{ maxHeight: '30rem', overflowY: 'auto' }}>
                    <Table bordered>
                      <thead className="sticky-top">
                        <tr>
                          <th>S No</th>
                          <th>Name of Indentor</th>
                          <th>Date</th>
                          <th>Purpose</th>
                          <th>View</th>
                          <th>Accept/Reject</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pendingRequests.length === 0 ? (
                          <tr>
                            <td colSpan="1" className="text-center">No pending requests</td>
                          </tr>
                        ) : (
                          pendingRequests.map((request, index) => (
                            <tr key={index}>
                              <td>{index+1}</td>
                              <td>{request.Username}</td>
                              <td>{request.date}</td>
                              <td>{request.purpose}</td>
                              <td>
                                <FaEye onClick={() => handleViewRequestDetails(request)} style={{ cursor: 'pointer' }} />
                              </td>
                              <td>
                                {request.status === 'approved by office' ? (
                                  <span>Approved by YOU</span>
                                ) : (
                                  <div>
                                    <Button variant="success" className="me-4" onClick={() => handleAcceptRequest(request.request_id)} style={{width:'5.5rem'}}>Approve</Button>
                                    <Button variant="danger" style={{width:'5.5rem'}} onClick={() => handleRejectRequest(request.request_id)}>Reject</Button>
                                  </div>
                                )}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </Table>
                  </div>
                </div>
              )}
              {currentView === 'approved' && (
                <div>
                  <h5 className="mb-3">Approved Requests Table</h5>
                  <div style={{ maxHeight: '30rem', overflowY: 'auto' }}>
                    <Table bordered>
                      <thead className="sticky-top">
                        <tr>
                          <th>S No</th>
                          <th>Date</th>
                          <th>Place</th>
                          <th>Vehicle Reporting Time</th>
                          <th>Purpose</th>
                          <th>View</th>
                        </tr>
                      </thead>
                      <tbody>
                        {approvedRequests.length === 0 ? (
                          <tr>
                            <td colSpan="1" className="text-center">No approved requests</td>
                          </tr>
                        ) : (
                          approvedRequests.map((request, index) => (
                            <tr key={index}>
                              <td>{index+1}</td>
                              <td>{request.date.split('T')[0]}</td>
                              <td>{request.place}</td>
                              <td>{request.vehicle_reporting_time}</td>
                              <td>{request.purpose}</td>
                              <td>
                                <FaEye onClick={() => handleViewRequestDetails(request)} style={{ cursor: 'pointer' }} />
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </Table>
                  </div>
                </div>
              )}
              {currentView === 'rejected' && (
                <div>
                  <h5 className="mb-3">Rejected Requests Table</h5>
                  <div style={{ maxHeight: '30rem', overflowY: 'auto' }}>
                    <Table bordered>
                      <thead className="sticky-top">
                        <tr>
                          <th>S No</th>
                          <th>Date</th>
                          <th>Place</th>
                          <th>Vehicle Reporting Time</th>
                          <th>Purpose</th>
                          <th>View</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rejectedRequests.length === 0 ? (
                          <tr>
                            <td colSpan="1" className="text-center">No rejected requests</td>
                          </tr>
                        ) : (
                          rejectedRequests.map((request, index) => (
                            <tr key={index}>
                              <td>{index+1}</td>
                              <td>{request.date.split('T')[0]}</td>
                              <td>{request.place}</td>
                              <td>{request.vehicle_reporting_time}</td>
                              <td>{request.purpose}</td>
                              <td>
                                <FaEye onClick={() => handleViewRequestDetails(request)} style={{ cursor: 'pointer' }} />
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </Table>
                  </div>
                </div>
              )}
            </div>
          </Col>
        </Row>
      </Container>
      <Modal show={selectedRequest !== null} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Request Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedRequest && (
            <div>
              {/* Display request details here */}
              <p><strong>Request ID:</strong> {selectedRequest.request_id}</p>
              <p><strong>Username:</strong>  {selectedRequest.Username}</p>
              <p><strong>College Name: </strong> {selectedRequest.college_name}</p>
              <p><strong>Guest Pickup Point:</strong>  {selectedRequest.pickup_point}</p>
              <p><strong>Vehicle Reporting Time:</strong>  {selectedRequest.vehicle_reporting_time}</p>
              <p><strong>Date: </strong> {new Date(selectedRequest.date).toLocaleDateString()}</p>
              <p><strong>Place: </strong> {selectedRequest.place}</p>
              <p><strong>Purpose:</strong>  {selectedRequest.purpose}</p>
              <p><strong>Guest Mobile: </strong> {selectedRequest.guest_mobile_no}</p>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>Close</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default OfficeDashboard;
