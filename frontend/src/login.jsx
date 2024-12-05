import React, { useState } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';


function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

 

    function handleSubmit(event) {
        event.preventDefault();
        axios.post('http://localhost:8081/login', { email, password})
            .then(res => {
                if (res.data.message === "Login Successfully") {
                    const userName = res.data.name;
                    const userId = res.data.userId;
                    const college_id = res.data.college_id
                    const role_id = res.data.role_id;
                    console.log("Logged in as:", userName);
                    console.log("User ID:", userId);
                    console.log("College Id", college_id);

                    if (role_id === 1) {
                        navigate(`/facultyDashboard/${userId}/${userName}/${college_id}`);
                    } else if (role_id === 2) {
                        navigate(`/officeDashboard/${userId}/${userName}/${college_id}`);
                    } else if (role_id === 3) {
                        navigate(`/adminDashboard/${userId}/${userName}/${college_id}`);
                    } 
                } else {
                    alert("Invalid credentials");
                }
            })
            .catch(err => console.log(err));
    }

    return (
        <div className='d-flex justify-content-center align-items-center bg-secondary vh-100'>
            <div className='bg-white p-3 rounded w-25'>
                <form onSubmit={handleSubmit} >
                    <div className='mb-3'>
                        <h2>WHEELS ON DEMAND</h2>
                        <label htmlFor="email"><strong>Email</strong></label>
                        <input
                            type="email"
                            placeholder="Enter Email"
                            className='form-control'
                            onChange={e => setEmail(e.target.value)}
                        />
                    </div>
                    <div className='mb-3'>
                        <label htmlFor="password"><strong>Password</strong></label>
                        <input
                            type="password"
                            placeholder="Enter Password"
                            className='form-control'
                            onChange={e => setPassword(e.target.value)}
                        />
                    </div>
                    <button type='submit' className='btn btn-success w-100 rounded-0' ><strong>Log in</strong></button>
                </form>
            </div>
        </div>
    )
}

export default Login;
