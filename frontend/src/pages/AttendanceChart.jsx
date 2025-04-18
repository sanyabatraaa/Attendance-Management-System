import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { Pie } from "react-chartjs-2";
import moment from "moment";
import { Chart, ArcElement, Tooltip, Legend } from "chart.js";
import { useNavigate } from "react-router-dom";
import { Context } from "../main"; // Authentication context
import { motion } from "framer-motion"; // Animations
import "./AttendanceChart.css";

Chart.register(ArcElement, Tooltip, Legend);

const AttendanceChart = () => {
    const { user, setUser, isAuthenticated, setIsAuthenticated } = useContext(Context);
    const navigate = useNavigate();

    const [attendanceData, setAttendanceData] = useState({ present: 0, absent: 0, absentDays: [] });
    const [year, setYear] = useState(moment().year());
    const [month, setMonth] = useState(moment().month() + 1);
    const [loading, setLoading] = useState(true);
    const [checkInTime, setCheckInTime] = useState(null);
    const [checkOutTime, setCheckOutTime] = useState(null);

    // Redirect if not authenticated
    
    
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
      if (!isAuthenticated) {
        navigate("/login");
      }
    // Fetch attendance data
    useEffect(() => {
        if (!isAuthenticated || !user) return;

        const fetchAttendance = async () => {
            try {
                setLoading(true);
                const { data } = await axios.get(
                    `http://localhost:5000/api/v1/employee/user/attendance?year=${year}&month=${month}`,
                    { withCredentials: true }
                );
                setAttendanceData({
                    present: data.present,
                    absent: data.absent,
                    absentDays: data.absentDays || [],
                });
            } catch (error) {
                console.error("Error fetching attendance data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAttendance();
    }, [year, month, user, isAuthenticated]);

    const chartData = {
        labels: ["Present", "Absent"],
        datasets: [
            {
                label: "Attendance",
                data: [attendanceData.present, attendanceData.absent],
                backgroundColor: ["#4CAF50", "#FF5722"],
                hoverBackgroundColor: ["#388E3C", "#E64A19"],
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        width: 600,
        height: 400,
    };

    return (
        <motion.div
            className="attendance-container"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
        >
            <motion.div
                className="controls"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
            >
                <label>Year: </label>
                <input type="number" value={year} onChange={(e) => setYear(e.target.value)} />
                <label>Month: </label>
                <input type="number" value={month} min="1" max="12" onChange={(e) => setMonth(e.target.value)} />
            </motion.div>

            <h2>Attendance for {moment(`${year}-${month}`, "YYYY-MM").format("MMMM YYYY")}</h2>
            {loading ? (
                <motion.div className="loading">Loading...</motion.div>
            ) : (
                <div className="attendance-content">
                    <motion.div
                        className="chart-section"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.5 }}
                        style={{ position: "relative", height: "400px", width: "600px" }}
                    >
                        <Pie data={chartData} options={options} />
                    </motion.div>
                    <motion.div
                        className="table-section"
                        initial={{ x: 50, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        <h3>Absent Days</h3>
                        <table>
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Day</th>
                                </tr>
                            </thead>
                            <tbody>
                                {attendanceData.absentDays.length > 0 ? (
                                    attendanceData.absentDays.map((day, index) => (
                                        <motion.tr
                                            key={index}
                                            whileHover={{ scale: 1.05 }}
                                            transition={{ type: "spring", stiffness: 200 }}
                                        >
                                            <td>{moment(`${year}-${month}-${day}`).format("DD MMM YYYY")}</td>
                                            <td>{moment(`${year}-${month}-${day}`).format("dddd")}</td>
                                        </motion.tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="2">No absent days</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </motion.div>
                </div>
            )}
        </motion.div> 
    );
};

export default AttendanceChart;
