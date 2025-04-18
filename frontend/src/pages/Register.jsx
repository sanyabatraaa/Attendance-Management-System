import axios from "axios";
import React, { useContext, useState } from "react";
import { toast } from "react-toastify";
import { Context } from "../main";
import { Link, Navigate, useNavigate } from "react-router-dom";
import "./Register.css";

const Register = () => {
  const { isAuthenticated } = useContext(Context);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState("");
  const [password, setPassword] = useState("");
  const [otpSent, setOtpSent] = useState(false);

  const navigateTo = useNavigate();

  const handleRegistration = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!firstName || !lastName || !email || !phone || !gender || !password) {
      toast.error("Please fill in all the fields!");
      return;
    }

    try {
      await axios.post(
        "http://localhost:5000/api/v1/employee/register",
        { firstName, lastName, email, phone, gender, password, role: "Employee", verificationMethod: "email" },
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        }
      );

      toast.success("OTP sent to your email. Please verify to complete registration.");
      setOtpSent(true);
      navigateTo(`/otp-verification/${email}`); // Redirect to OTP page
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong!");
    }
  };

  if (isAuthenticated) {
    return <Navigate to="/" />;
  }

  return (
    <div className="container form-component register-form">
      <h2>Sign Up</h2>
      <p>Please Sign Up To Continue</p>
      <form onSubmit={handleRegistration}>
        <div>
          <input
            type="text"
            placeholder="First Name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            aria-label="First Name"
          />
          <input
            type="text"
            placeholder="Last Name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            aria-label="Last Name"
          />
        </div>
        <div>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-label="Email"
          />
          <input
            type="number"
            placeholder="Phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            aria-label="Phone"
          />
        </div>
        <div>
          <select
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            aria-label="Gender"
          >
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            aria-label="Password"
          />
        </div>

        <div className="register-section">
          <p>Already Registered?</p>
          <Link to="/login">Login Now</Link>
          <button type="submit">Register & Send OTP</button> {/* This triggers OTP */}
        </div>
      </form>
    </div>
  );
};

export default Register;
