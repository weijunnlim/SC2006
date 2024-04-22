import React, { useState, useEffect } from 'react';
import NavBar2 from "./NavBar2";
import { useUser } from '../../contexts/UserContext';
 
  const RestaurantBookingsPage = () => {
    const { user } = useUser();
    const [error, setError] = useState(null);
    const [bookings, setBookings] = useState([]);
    const [isAvailable, setIsAvailable] = useState(true); // Assuming the default status is available
    const [waitingTime, setWaitingTime] = useState(0);
  
    useEffect(() => {
      const fetchReservationData = async () => {
        try {
          const response = await fetch(`http://localhost:4000/api/reservation/allReservations/${user}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          });
  
          if (!response.ok) {
            const json = await response.json();
            setError(json.error);
            setBookings([]);
          } else {
            const json = await response.json();
            setBookings(json.upcoming_reservations || []);
          }
        } catch (error) {
          console.error('Error fetching reservation data:', error);
          setError("Failed to fetch reservation data");
        }
      };
  
      fetchReservationData();
    }, [user]);
  
    const toggleAvailability = () => {
      setIsAvailable(!isAvailable);
      // Update the restaurant's availability status in your backend
    };
  
    const handleWaitingTimeChange = (event) => {
      const time = Math.min(Number(event.target.value), 90); // Limiting to 90 minutes
      setWaitingTime(time);
      // Update the waiting time in your backend
    };
  
    return (
      <>
        <NavBar2 />
        <div className="container mt-4">
          <h2>Restaurant Bookings</h2>
          <table className="table">
            <thead>
              <tr>
                <th>Name of Patron</th>
                {/* for future implementation
                <th>Phone Number</th> */}
                <th>Date of Booking</th>
                <th>Time of Booking</th>
                <th>Number of Pax</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => (
                <tr key={booking.id}>
                  <td>{booking.patron_name}</td>
                  {/* for future implementation if possible
                  <td>{booking.phoneNumber}</td> */}
                  <td>{booking.date_reservation}</td>
                  <td>{booking.time_reservation}</td>
                  <td>{booking.pax_size}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mb-3">
            <label htmlFor="availabilityToggle" className="form-label">Restaurant Availability:</label>
            <button className="btn btn-secondary" onClick={toggleAvailability}>
              {isAvailable ? 'Available for Booking' : 'Unavailable for Booking'}
            </button>
          </div>
          <div className="mb-3">
            <label htmlFor="waitingTime" className="form-label">Estimated Waiting Time (up to 90 mins):</label>
            <input type="number" className="form-control" id="waitingTime" value={waitingTime} onChange={handleWaitingTimeChange} />
          </div>
        </div>
      </>
    );
  }
  
  export default RestaurantBookingsPage;