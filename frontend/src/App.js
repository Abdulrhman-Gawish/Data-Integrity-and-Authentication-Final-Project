import React from "react";
import Signup from "./pages/SignupPage";
import Setup2FA from "./pages/setup2FA";
import Login from "./pages/LoginPage";
import OTPVerification from "./pages/OTPVerification";
import UserDashboard from "./pages/userDashboard";
import AdminDashboard from "./pages/adminDashboard";
import Homepage from "./pages/HomePage";
import { BrowserRouter, Route, Routes } from "react-router-dom";


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/adminDashboard" element={<AdminDashboard />} />
        <Route path="/userDashboard" element={<UserDashboard />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/setup-2fa" element={<Setup2FA />} />
        <Route path="/verify-2fa" element={<OTPVerification />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
