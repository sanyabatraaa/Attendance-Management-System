import React, { useEffect, useState } from "react";
import { PieChart, Pie, Tooltip, Cell, Legend } from "recharts";
import axios from "axios";

// Function to fetch logged-in user's attendance data
const fetchUserAttendanceData = async (month, year) => {
    try {
        console.log(`Fetching attendance data for month: ${month}, year: ${year}`);
        const response = await axios.get(`http://localhost:5000/api/v1/employee/user/attendance`, {
            params: { month, year },
            withCredentials: true // Ensure credentials are passed along
        });
        console.log("Attendance data fetched:", response.data);
        return response.data.data; // Ensure this matches API response structure
    } catch (error) {
        console.error("Error fetching user attendance data:", error.response?.data || error.message);
        return { attendance: [] }; // Return a consistent structure to prevent errors
    }
};

// Function to calculate the number of days in a month excluding Sundays and holidays
const getExcludedDaysCount = (month, year, holidays = []) => {
    console.log(`Calculating excluded days for month: ${month}, year: ${year}, holidays: ${holidays}`);
    
    // Get the number of days in the month
    const daysInMonth = new Date(year, month, 0).getDate();
    
    // Initialize counters
    let excludedDays = 0;
    
    // Iterate through each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month - 1, day);
        
        // Check if it's a Sunday
        if (date.getDay() === 0) {
            excludedDays++;
        }
        
        // Check if it's a holiday
        if (holidays.includes(date.toISOString().split("T")[0])) {
            excludedDays++;
        }
    }
    
    console.log(`Excluded days count: ${excludedDays}`);
    return excludedDays;
};

// Function to process attendance data for the graph
const processAttendanceData = (attendanceData, month, year, holidays) => {
    console.log(`Processing attendance data for month: ${month}, year: ${year}`);

    // Get today's date
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1; // 1-based index (1 = January)
    const currentYear = currentDate.getFullYear();

    // If the selected month is greater than the current month, return 0 for present and absent counts
    if (year > currentYear || (year === currentYear && month > currentMonth)) {
        console.log("Month is in the future, marking all days as absent.");
        return [
            { name: "Present", attendance: 0 },
            { name: "Absent", attendance: 0 },
            { absentDates: [] }
        ];
    }

    // If no attendance data is available, mark user as absent for all the working days till now
    if (!attendanceData || attendanceData.length === 0) {
        console.log("No attendance data found, marking all days as absent.");
        const excludedDays = getExcludedDaysCount(month, year, holidays);
        const totalDaysInMonth = new Date(year, month, 0).getDate();
        const totalWorkingDays = totalDaysInMonth - excludedDays; // Remove Sundays and holidays

        return [
            { name: "Present", attendance: 0 },
            { name: "Absent", attendance: totalWorkingDays },
            { absentDates: [] }
        ];
    }

    const attendanceCount = {
        present: 0,
        absent: 0,
        absentDates: [] // Store dates when the user was absent
    };

    // Get the excluded (absent) days count (Sundays + holidays)
    const excludedDays = getExcludedDaysCount(month, year, holidays);

    // Calculate total days in the month
    const totalDaysInMonth = new Date(year, month, 0).getDate();
    const totalWorkingDays = totalDaysInMonth - excludedDays; // Remove Sundays and holidays
    console.log(`Total working days: ${totalWorkingDays}`);

    // Calculate the number of days to consider (up to today if before the end of the month)
    const daysToConsider = (year === currentYear && month === currentMonth) ? currentDate.getDate() : totalDaysInMonth;
    console.log(`Considering attendance up to day: ${daysToConsider}`);

    // Iterate through the attendance data for days up to the current day
    attendanceData.forEach((att, index) => {
        const date = new Date(year, month - 1, index + 1); // Get date for each attendance entry
        
        if (index < daysToConsider) {
            if (!att.checkIn) {
                // Mark absence if no check-in on that day
                attendanceCount.absent++;
                attendanceCount.absentDates.push(date.toISOString().split("T")[0]); // Add absent date
            } else {
                attendanceCount.present++;
            }
        }
    });

    // Dynamically calculate absent days based on present count
    const absentDays = totalWorkingDays - attendanceCount.present;

    console.log(`Attendance count: Present = ${attendanceCount.present}, Absent = ${absentDays}`);

    // Update chart data
    return [
        { name: "Present", attendance: attendanceCount.present },
        { name: "Absent", attendance: absentDays },
        { absentDates: attendanceCount.absentDates } // Include absent dates
    ];
};



const AttendanceChart = () => {
    const [attendanceData, setAttendanceData] = useState([]);
    const [month, setMonth] = useState(2); // Default to February
    const [year, setYear] = useState(2025); // Default to 2025
    const [holidays, setHolidays] = useState(["2025-02-14", "2025-02-28"]); // Example holidays (add more as needed)

    // Fetch attendance data whenever month or year changes
    useEffect(() => {
        const fetchData = async () => {
            console.log(`Fetching data for month: ${month}, year: ${year}`);
            const response = await fetchUserAttendanceData(month, year); 
            if (response.attendance) {
                const processedData = processAttendanceData(response.attendance, month, year, holidays);
                console.log("Processed data:", processedData);
                setAttendanceData(processedData);
            }
        };
        fetchData();
    }, [month, year, holidays]); // Re-fetch data when month, year, or holidays change

    const handleMonthChange = (e) => {
        setMonth(Number(e.target.value)); // Update month
    };

    const handleYearChange = (e) => {
        setYear(Number(e.target.value)); // Update year
    };

    const COLORS = ["#0088FE", "#FF8042"]; // Blue for present, Orange for absent

    return (
        <div style={{ textAlign: "center" }}>
            <h2>Your Attendance Distribution</h2>

            {/* Dropdown for selecting month */}
            <div>
                <label>Month: </label>
                <select value={month} onChange={handleMonthChange}>
                    {Array.from({ length: 12 }, (_, i) => (
                        <option key={i} value={i + 1}>
                            {new Date(0, i).toLocaleString('default', { month: 'long' })}
                        </option>
                    ))}
                </select>
            </div>

            {/* Dropdown for selecting year */}
            <div>
                <label>Year: </label>
                <select value={year} onChange={handleYearChange}>
                    <option value={2023}>2023</option>
                    <option value={2024}>2024</option>
                    <option value={2025}>2025</option>
                </select>
            </div>

            {/* Display present and absent counts */}
            <div>
                <p><strong>Present:</strong> {attendanceData.length > 0 ? attendanceData[0].attendance : 0}</p>
                <p><strong>Absent:</strong> {attendanceData.length > 0 ? attendanceData[1].attendance : 0}</p>
            </div>

            {/* Display absent dates */}
            {attendanceData.length > 0 && attendanceData[2]?.absentDates?.length > 0 && (
                <div>
                    <h3>Absent Dates:</h3>
                    <ul>
                        {attendanceData[2].absentDates.map((date, index) => (
                            <li key={index}>{new Date(date).toLocaleDateString()}</li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Render chart only if there is data */}
            {attendanceData.length > 0 ? (
                <PieChart width={400} height={400}>
                    <Pie
                        data={attendanceData.slice(0, 2)} // Only use present and absent data for the pie chart
                        dataKey="attendance"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={150}
                        fill="#8884d8"
                        label
                    >
                        {attendanceData.slice(0, 2).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip formatter={(value, name) => [`${name}: ${value} days`, name]} />
                    <Legend />
                </PieChart>
            ) : (
                <p>No attendance data available for this month.</p>
            )}
        </div>
    );
};

export default AttendanceChart;
