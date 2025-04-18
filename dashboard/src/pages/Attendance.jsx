import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import './Attendance.css';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { Context } from '../main';
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';
import { useNavigate } from 'react-router-dom';

const Attendance = () => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [filteredAttendance, setFilteredAttendance] = useState([]);
  const [error, setError] = useState(null);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [mapType, setMapType] = useState(null); // To toggle between check-in and check-out map
  const {isAuthenticated, setIsAuthenticated } = useContext(Context);
  const navigateTo=useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigateTo('/');  // Redirect to login page
    }
  }, [isAuthenticated, navigateTo]);
  useEffect(() => {
    axios
      .get("http://localhost:5000/api/v1/employee/attendance", {
        withCredentials: true, // Include credentials if required
      })
      .then((response) => {
        console.log('API Response:', response.data);
        setAttendanceData(response.data.data); 
        setIsAuthenticated(true); 
      })
      .catch((err) => {
        console.error('Error fetching attendance data:', err);
        setError('Error fetching attendance data');
        setIsAuthenticated(false);
      });
  }, []);

  useEffect(() => {
    if (selectedDate && Array.isArray(attendanceData)) {
      const dateStr = selectedDate
        .toLocaleDateString("en-IN", {
          timeZone: "Asia/Kolkata",
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        })
        .split("/")
        .reverse()
        .join("-"); // Convert to yyyy-mm-dd format

      const filtered = attendanceData.flatMap((user) => {
        return user.attendence
          .filter((entry) => {
            const checkInDate = new Date(entry.checkIn)
              .toISOString()
              .split("T")[0];
            return checkInDate === dateStr;
          })
          .map((entry) => ({
            name: user.name,
            email: user.email,
            checkIn: entry.checkIn,
            checkOut: entry.checkOut || "N/A",
            checkInLocation: entry.checkInLocation, // Add location
            checkOutLocation: entry.checkOutLocation, // Add location
            checkInImage:entry.checkInImage,
            checkOutImage:entry.checkOutImage
          }));
      });

      setFilteredAttendance(filtered);
    } else {
      setFilteredAttendance([]);
    }
  }, [selectedDate, attendanceData]);

  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  const handleViewClick = (entry, type) => {
    setSelectedEntry(entry);
    setMapType(type); // Set the type to either check-in or check-out
  };

  const extractTime = (date) => {
    const localDate = new Date(date);
    const offset = 5.5 * 60;
    const utcTime = localDate.getTime() + localDate.getTimezoneOffset() * 60000;
    const istTime = new Date(utcTime + offset * 60000);
    return istTime.toISOString().substring(11, 19); // Extracts hh:mm:ss
  };

  const isValidLocation = (location) => {
    return location && typeof location.latitude === 'number' && typeof location.longitude === 'number';
  };

  const center = {
    lat: selectedEntry?.checkInLocation?.latitude || 28.7041, 
    lng: selectedEntry?.checkInLocation?.longitude || 77.1025
  };
 

  return (
    <div className="attendance-container">
      <h2>Attendance</h2>

      {/* Date Picker */}
      <div className="date-picker-container">
        <label>Select a Date:</label>
        <DatePicker
          selected={selectedDate}
          onChange={handleDateChange}
          dateFormat="yyyy-MM-dd"
          isClearable
          placeholderText="Select a date"
        />
      </div>

      {/* Error handling */}
      {error && <div className="error">{error}</div>}

      {/* Attendance Table */}
      <div className="attendance-list">
        {filteredAttendance.length > 0 ? (
          <table className="attendance-table">
            <thead>
              <tr>
                <th>Email</th>
                <th>Check-In Time</th>
                <th>Check-Out Time</th>
                <th>Check-In Location</th>
                <th>Check-Out Location</th>
                <th>Check-In Image</th>
                <th>Check-Out Image</th>
              </tr>
            </thead>
            <tbody>
              {filteredAttendance.map((entry, index) => (
                <tr key={index}>
                  <td>{entry.email}</td>
                  <td>{extractTime(entry.checkIn)}</td>
                  <td>{entry.checkOut !== "N/A" ? extractTime(entry.checkOut) : "Not checked out"}</td>
                  <td>
                    {entry.checkInLocation && isValidLocation(entry.checkInLocation) ? (
                      <button onClick={() => handleViewClick(entry, 'checkin')}>View Check-In Location</button>
                    ) : (
                      <span>No Check-In Location</span>
                    )}
                  </td>
                  <td>
                    {entry.checkOutLocation && isValidLocation(entry.checkOutLocation) ? (
                      <button onClick={() => handleViewClick(entry, 'checkout')}>View Check-Out Location</button>
                    ) : (
                      <span>No Check-Out Location</span>
                    )}
                  </td>
                  <td>
                   <a href={entry.checkInImage}> CheckIn Image</a>
                  </td>
                  <td>
                   <a href={entry.checkOutImage}> CheckOut Image</a>
                  </td>
                  { console.log(entry.checkInImage)}
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No attendance records for this date</p>
        )}
      </div>

      {/* Map Modal for Check-In or Check-Out Location */}
      {selectedEntry && (
        <div className="map-container">
          <h3>{mapType === 'checkin' ? 'Check-In Location' : 'Check-Out Location'}</h3>
          <LoadScript googleMapsApiKey="AIzaSyBwmTepriF6pebmF-kgjhTGho9tA84WRq0">
            <GoogleMap
              mapContainerStyle={{ width: '100%', height: '400px' }}
              center={center}
              zoom={14} // Adjust zoom level
            >
              {/* Check-In or Check-Out Marker */}
              {mapType === 'checkin' && selectedEntry.checkInLocation && isValidLocation(selectedEntry.checkInLocation) && (
                <Marker position={{
                  lat: selectedEntry.checkInLocation.latitude,
                  lng: selectedEntry.checkInLocation.longitude
                }}>
                  <InfoWindow position={{
                    lat: selectedEntry.checkInLocation.latitude,
                    lng: selectedEntry.checkInLocation.longitude
                  }}>
                    <div>
                      <strong>Check-In Location:</strong>
                      <br />
                      {`Lat: ${selectedEntry.checkInLocation.latitude}, Lng: ${selectedEntry.checkInLocation.longitude}`}
                    </div>
                  </InfoWindow>
                </Marker>
              )}

              {mapType === 'checkout' && selectedEntry.checkOutLocation && isValidLocation(selectedEntry.checkOutLocation) && (
                <Marker position={{
                  lat: selectedEntry.checkOutLocation.latitude,
                  lng: selectedEntry.checkOutLocation.longitude
                }}>
                  <InfoWindow position={{
                    lat: selectedEntry.checkOutLocation.latitude,
                    lng: selectedEntry.checkOutLocation.longitude
                  }}>
                    <div>
                      <strong>Check-Out Location:</strong>
                      <br />
                      {`Lat: ${selectedEntry.checkOutLocation.latitude}, Lng: ${selectedEntry.checkOutLocation.longitude}`}
                    </div>
                  </InfoWindow>
                </Marker>
              )}
            </GoogleMap>
          </LoadScript>
        </div>
      )}
    </div>
  );
};

export default Attendance;
