import React, { useState, useEffect, useRef, useContext } from "react";
import axios from "axios";
import { Context } from "../main";
import "./Home.css";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const HomePage = () => {
  const [checkInTime, setCheckInTime] = useState(null);
  const [checkOutTime, setCheckOutTime] = useState(null);
  const { isAuthenticated, setIsAuthenticated, setUser, user } = useContext(Context);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  // UseEffect to handle redirect if user is not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        console.log("Fetching user data...");
        const response = await axios.get("http://localhost:5000/api/v1/employee/me", { withCredentials: true });
        console.log("User data received:", response.data.user);
        setIsAuthenticated(true);
        setUser(response.data.user);
        
        const attendance = response.data.user.attendence;
        const currentDate = new Date().toISOString().split("T")[0];
        const todayAttendance = attendance.find(att => att.checkIn?.split("T")[0] === currentDate);
        
        if (todayAttendance) {
          setCheckInTime(todayAttendance.checkIn);
          if (todayAttendance.checkOut) {
            setCheckOutTime(todayAttendance.checkOut);
          }
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        setIsAuthenticated(false);
        setUser({});
      }
    };
    fetchUser();
  }, [setIsAuthenticated, setUser]);

  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error("Error accessing camera:", error);
        toast.error("Camera access denied. Please allow camera permission.");
      }
    };
    startCamera();
  }, []);

  const captureImage = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    if (video && canvas) {
      const ctx = canvas.getContext("2d");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      const imageData = canvas.toDataURL("image/jpeg");
      setCapturedImage(imageData);
    }
  };

  const handleLocationRequest = (callback) => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        console.log("Location obtained:", position.coords);
        callback(position.coords.latitude, position.coords.longitude);
      },
      (error) => {
        console.error("Error getting location:", error);
        toast.error("Failed to get location: " + error.message);
      }
    );
  };

  const handleCheckInOut = (checkType) => handleLocationRequest(async (latitude, longitude) => {
    if (!capturedImage) {
      setMessage("Please capture an image first.");
      return;
    }
    
    setLoading(true);
    setMessage("");
    
    try {
      console.log(`Sending ${checkType} request...`);
      const formData = new FormData();
      formData.append("image", capturedImage);
      formData.append("latitude", latitude);
      formData.append("longitude", longitude);
      
      const response = await axios.post(`http://localhost:5000/api/v1/employee/${checkType}`, formData, { withCredentials: true });
      
      console.log(`${checkType} successful:`, response.data);
      if (checkType === "checkin") {
        setCheckInTime(response.data.data.checkIn);
        setCheckOutTime(null);
      } else {
        setCheckOutTime(response.data.checkOut);
      }
      toast.success(`${checkType.charAt(0).toUpperCase() + checkType.slice(1)} Successful!`);
      setCapturedImage(null);
    } catch (error) {
      console.error(`${checkType} failed:`, error);
      toast.error(error.response?.data?.message || `${checkType.charAt(0).toUpperCase() + checkType.slice(1)} Failed`);
    } finally {
      setLoading(false);
    }
  });

  return (
    <div className="home-page">
      {user && (
        <>
          <h1>Welcome, {user.firstName || "Employee"}!</h1>
          <p><strong>Employee Name:</strong> {user.firstName + " " + user.lastName}</p>
          <p><strong>Email:</strong> {user.email || "Not Available"}</p>
          <p><strong>Gender:</strong> {user.gender || "Not Available"}</p>
          <h2>Your Attendance Status</h2>
          <p><strong>Check-in Time:</strong> {checkInTime ? checkInTime.substr(11, 5) : "Not Checked In"}</p>
          <p><strong>Check-out Time:</strong> {checkOutTime ? checkOutTime.substr(11, 5) : "Not Checked Out"}</p>
          <video ref={videoRef} autoPlay playsInline className="video-feed" />
          <canvas ref={canvasRef} style={{ display: "none" }} />
          {capturedImage && <img src={capturedImage} alt="Captured" className="captured-preview" />}
          <button onClick={captureImage} disabled={loading}>📸 Capture Image</button>
          {!checkInTime && <button onClick={() => handleCheckInOut("checkin")} disabled={loading}>Check-In</button>}
          {checkInTime && !checkOutTime && <button onClick={() => handleCheckInOut("checkout")} disabled={loading}>Check-Out</button>}
        </>
      )}
    </div>
  );
};

export default HomePage;
