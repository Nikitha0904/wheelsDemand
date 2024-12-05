import React from "react";
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from "./login";
import FacultyDashboard from "./facultyDashboard";
import VehicleRequisitionForm from "./requisitionForm";
import OfficeDashboard from "./officeDashboard";
import AdminDashboard from "./adminDashboad";
import VehicleDriverAllocation from "./vehicleAllocate";
import ManageDrivers from "./manageDrivers";
import ManageVehicles from "./manageVehicles";


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/facultyDashboard/:userId/:userName/:college_id" element={<FacultyDashboard />} />
        <Route path="/requisitionForm/:userId/:userName/:college_id" element={<VehicleRequisitionForm />} />
        <Route path="/login" element={<Login />} />
        <Route path="/officeDashboard/:userId/:userName/:college_id" element={<OfficeDashboard/>} />
        <Route path="/adminDashboard/:userId/:userName/:college_id" element={<AdminDashboard/>} />
 
        <Route path="/vehicleAllocate/:request_id/:userId/:userName/:college_id" element={<VehicleDriverAllocation/>} />
        <Route path="/manageDrivers" element={<ManageDrivers/>} />
        <Route path="/manageVehicles" element={<ManageVehicles/>} />






        


      </Routes>
    </BrowserRouter>
  );
}

export default App;
