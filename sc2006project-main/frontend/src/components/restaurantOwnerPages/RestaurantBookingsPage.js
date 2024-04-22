import React, { useState, useEffect } from 'react';
import NavBar2 from "./NavBar2";
import { useUser } from '../../contexts/UserContext';
 
  const RestaurantBookingsPage = () => {
    const { user } = useUser();
    const [error, setError] = useState(null);
    const [bookings, setBookings] = useState([]);
    const [isAvailable, setIsAvailable] = useState(true); // Assuming the default status is available
    const [waitingTime, setWaitingTime] = useState(0);
    const [inputWaitingTime, setInputWaitingTime] = useState(0);  
  
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
      if (window.confirm(`Are you sure you want to change the availability to ${!isAvailable ? 'available' : 'unavailable'}?`)) {
        const newAvailability = !isAvailable;
        setIsAvailable(newAvailability);
    
        // Call the API to update the backend
        updateAvailability(newAvailability);
      }
    };

    const updateAvailability = async (newAvailability) => {
      try {
        const response = await fetch(`http://localhost:4000/api/profile/availability/${user}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ isAvailable: newAvailability })
        });
    
        if (!response.ok) {
          const json = await response.json();
          setError(`Failed to update availability: ${json.error}`);
          console.error('Error updating availability:', json.error);
        } else {
          console.log('Availability updated successfully');
        }
      } catch (error) {
        console.error('Error updating availability:', error);
        setError("Failed to update availability");
      }
    };

    useEffect(() => {
      const fetchAvailability = async () => {
        try {
          const response = await fetch(`http://localhost:4000/api/profile/availability/${user}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          });
    
          if (!response.ok) {
            throw new Error('Failed to fetch availability');
          }
          const data = await response.json();
          setIsAvailable(data.isAvailable); 
        } catch (error) {
          console.error('Error fetching availability:', error);
          setError("Failed to fetch availability");
        }
      };
    
      fetchAvailability();
    }, [user]);

    const updateWaitingTime = async (newTime) => {
      try {
        const response = await fetch(`http://localhost:4000/api/profile/waitingTime/${user}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ waitingTime: newTime })
        });
    
        if (!response.ok) {
          const json = await response.json();
          setError(json.error);
          console.error('Error updating waiting time:', json.error);
        } else {
          console.log('Waiting time updated successfully');
        }
      } catch (error) {
        console.error('Error updating waiting time:', error);
        setError("Failed to update waiting time");
      }
    };

    const handleWaitingTimeInputChange = (event) => {
      const newTime = Math.max(0, Math.min(Number(event.target.value), 90)); //between 0 to 90 mins as stated in SRS
      setInputWaitingTime(newTime);
    };

    const confirmWaitingTimeUpdate = () => {
      if (window.confirm(`Are you sure you want to update the waiting time to ${inputWaitingTime} minutes?`)) {
        setWaitingTime(inputWaitingTime);
        updateWaitingTime(inputWaitingTime);
      }
    };

    useEffect(() => {
      const fetchWaitingTime = async () => {
        try {
          const response = await fetch(`http://localhost:4000/api/profile/waitingTime/${user}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          });
    
          if (!response.ok) {
            const json = await response.json();
            throw new Error(`Failed to fetch waiting time: ${json.error}`);
          }
          const data = await response.json();
          setWaitingTime(data.waitingTime);
        } catch (error) {
          console.error('Error fetching waiting time:', error);
          setError("Failed to fetch waiting time");
        }
      };
    
      fetchWaitingTime();
    }, [user]);
  
    return (
      <>
        <NavBar2 />
        <div className="container mt-4">
          <h2>Restaurant Bookings</h2>
          <table className="table">
            <thead>
              <tr>
                <th>Name of Patron</th>
                <th>Phone Number</th> 
                <th>Date of Booking</th>
                <th>Time of Booking</th>
                <th>Number of Pax</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => (
                <tr key={booking.id}>
                  <td>{booking.patron_name}</td>
                  <td>{booking.patron_contact}</td>
                  <td>{booking.date_reservation}</td>
                  <td>{booking.time_reservation}</td>
                  <td>{booking.pax_size}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mb-3">
            <label htmlFor="availabilityToggle" className="form-label"><strong>Restaurant Availability: </strong></label>
            <button 
              className={`btn ${isAvailable ? 'btn-success' : 'btn-danger'}`} 
              onClick={toggleAvailability}>
              {isAvailable ? 'Available for Booking' : 'Unavailable for Booking'}
            </button>
          </div>
          <div className="mb-3">
            <label htmlFor="waitingTime" className="form-label"><strong>Estimated Waiting Time (up to 90 mins): {waitingTime} minutes</strong></label>
            <div className="input-group">
              <input
              type="number"
              className="form-control"
              id="waitingTime"
              value={inputWaitingTime}
              onChange={handleWaitingTimeInputChange}
              placeholder="Enter waiting time..."
              />
              <button className="btn btn-primary" onClick={confirmWaitingTimeUpdate}>Confirm Time</button>
          </div>
          </div>
        </div>
      </>
    );
  }
  
  export default RestaurantBookingsPage;