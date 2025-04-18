import React, { useState } from "react";
import AttendanceChart from "./AttendanceChart";

const AttendanceDashboard = () => {
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [year, setYear] = useState(new Date().getFullYear());

    return (
        <div>
            <h1>Attendance Dashboard</h1>
            
            <label>Month: </label>
            <select value={month} onChange={(e) => setMonth(parseInt(e.target.value))}>
                {Array.from({ length: 12 }, (_, i) => (
                    <option key={i + 1} value={i + 1}>
                        {new Date(0, i).toLocaleString("default", { month: "long" })}
                    </option>
                ))}
            </select>

            <label>Year: </label>
            <input type="number" value={year} onChange={(e) => setYear(parseInt(e.target.value))} />

            <AttendanceChart month={month} year={year} />
        </div>
    );
};

export default AttendanceDashboard;
