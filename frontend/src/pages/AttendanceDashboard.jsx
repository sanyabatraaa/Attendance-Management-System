// import React, { useState, useEffect, useContext } from "react";
// import { useNavigate } from "react-router-dom";
// import AttendanceChart from "./AttendanceChart";
// import axios from "axios";
// import { Context } from "../main";

// const AttendanceDashboard = () => {
//     const { user, isAuthenticated } = useContext(Context);
//     const navigate = useNavigate();
//     const [month, setMonth] = useState(new Date().getMonth() + 1);
//     const [year, setYear] = useState(new Date().getFullYear());
//     const [attendanceData, setAttendanceData] = useState([]);
//     const [absentDates, setAbsentDates] = useState([]);

//     useEffect(() => {
//         if (!isAuthenticated) {
//             navigate("/login");
//             return;
//         }

//         const fetchUserAttendance = async () => {
//             try {
//                 const response = await axios.get("http://localhost:5000/api/v1/employee/user/attendance", {
//                     params: { month, year },
//                     withCredentials: true
//                 });
//                 const processedData = processAttendanceData(response.data.data, month, year);
//                 setAttendanceData(processedData.chartData);
//                 setAbsentDates(processedData.absentDates);
//             } catch (error) {
//                 console.error("Error fetching user attendance data:", error);
//             }
//         };

//         fetchUserAttendance();
//     }, [month, year, isAuthenticated, navigate]);

//     return (
//         <div>
//             <h1>Attendance Dashboard</h1>
//             <label>Month: </label>
//             <select value={month} onChange={(e) => setMonth(parseInt(e.target.value))}>
//                 {Array.from({ length: 12 }, (_, i) => (
//                     <option key={i + 1} value={i + 1}>
//                         {new Date(0, i).toLocaleString("default", { month: "long" })}
//                     </option>
//                 ))}
//             </select>
//             <label>Year: </label>
//             <input type="number" value={year} onChange={(e) => setYear(parseInt(e.target.value))} />
//             <AttendanceChart attendanceData={attendanceData} absentDates={absentDates} />
//         </div>
//     );
// };

// export default AttendanceDashboard;

// const processAttendanceData = (attendanceData, month, year) => {
//     const currentDate = new Date();
//     const currentMonth = currentDate.getMonth() + 1;
//     const currentYear = currentDate.getFullYear();
//     const today = currentDate.getDate();
//     const daysToConsider = (year === currentYear && month === currentMonth) ? today : new Date(year, month, 0).getDate();

//     let present = 0;
//     let absentDates = [];
//     for (let i = 1; i <= daysToConsider; i++) {
//         const date = new Date(year, month - 1, i);
//         const formattedDate = date.toISOString().split("T")[0];
//         if (date.getDay() === 0 || date.getDay() === 6) continue;

//         const isPresent = attendanceData.some(att => att.date === formattedDate && att.checkIn && att.checkOut);
//         if (isPresent) {
//             present++;
//         } else {
//             absentDates.push(formattedDate);
//         }
//     }
//     const absent = absentDates.length;

//     return {
//         chartData: [
//             { name: "Present", attendance: present },
//             { name: "Absent", attendance: absent }
//         ],
//         absentDates
//     };
// };
