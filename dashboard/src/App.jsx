import "./App.css";
import { Route, BrowserRouter as Router, Routes, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import AttendanceDashboard from "./pages/AttendanceDashboard";

import Attendance from "./pages/Attendance";
// import Prediction from "./Pages/Prediction";

const App = () => {
  return (
    <>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path='/attendance' element={<Attendance/>}/>
          <Route path="/user/attendance" element={<AttendanceDashboard />} />
        </Routes>
        <ToastContainer position="top-center" />
        <Footer />
      </Router>
      
    </>
  );
}

export default App;
