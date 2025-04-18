import "./App.css";
import { Route, BrowserRouter as Router, Routes, Navigate } from "react-router-dom";
import Home from "./pages/Home";
// import Appointment from "./pages/Appointment";
// import AboutUs from "./pages/AboutUs";
import Register from "./pages/Register";
import Login from "./pages/Login";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { useContext, useEffect } from "react";
import axios from "axios";
import { Context } from "./main";
import OtpVerification from "./components/OtpVerification";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import AttendanceChart from "./pages/AttendanceChart";
// import Prediction from "./Pages/Prediction";

const App = () => {
  const { isAuthenticated, setIsAuthenticated, setUser } = useContext(Context);

  // useEffect(() => {
  //   const fetchUser = async () => {
  //     try {
  //       const response = await axios.get(
  //         "http://localhost:5000/api/v1/employee/me",
  //         { withCredentials: true }
  //       );
  //       setIsAuthenticated(true);
  //       setUser(response.data.user);
  //     } catch (error) {
  //       setIsAuthenticated(false);
  //       setUser({});
  //       toast.error("Failed to fetch user. Please log in.");
  //     }
  //   };
  //   fetchUser();
  // }, []); // Only run once on component mount

  return (
    <>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/otp-verification/:email" element={<OtpVerification />} />
          <Route path="/password/forgot" element={<ForgotPassword />} />
          <Route path="/password/reset/:token" element={<ResetPassword />} />
          <Route path="/user/attendance" element={<AttendanceChart />} />
        </Routes>
        <ToastContainer position="top-center" />
        <Footer />
      </Router>
      
    </>
  );
}

export default App;
