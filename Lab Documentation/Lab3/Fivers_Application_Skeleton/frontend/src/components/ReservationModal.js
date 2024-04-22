import React, { useState } from 'react';
import { useUser } from '../contexts/UserContext';

function ReservationModal({ restaurant, onClose, onSubmit }) {
    // State for reservation form inputs
    const { user } = useUser();
    const [dateReservation, setDateReservation] = useState('');
    const [timeReservation, setTimeReservation] = useState('');
    const [paxSize, setPaxSize] = useState('');
    const [error, setError] = useState(null);
  
    // Handle form submission
    const handleSubmit = async (e) => {
      e.preventDefault();

      const reservationDetails = {
          restaurantName: restaurant.Name,
          dateReservation,
          timeReservation,
          paxSize
      };
      
      try {
          const response = await fetch(`http://localhost:4000/api/reservation`, {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                  patron_uid: user,
                  restaurant_uid: localStorage.getItem('restaurant_id'),
                  date_reservation: dateReservation,
                  time_reservation: timeReservation,
                  pax_size: paxSize,
              }),
          });
          console.log(user)

          const json = await response.json()

          if(!response.ok) {
            setError(json.error)
          }
          console.log(json); // For debugging
          // Optionally, call onSubmit with result if needed
          //  onSubmit && onSubmit(json);
          
          // Close the modal
          onClose();
      } catch (error) {
          console.error('There was an issue with your reservation:', error);
      }
  };
  
    return (
      <div className="modal" style={{ display: 'block', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
        <div className="modal-dialog">
          <div className="modal-content">
            <form onSubmit={handleSubmit}>
              <div className="modal-header">
                <h5 className="modal-title">Book a Table at {restaurant.Name}</h5>
                <button type="button" className="btn-close" onClick={onClose}></button>
              </div>
              <div className="modal-body">
                {/* Form fields for reservation details */}
                <div className="mb-3">
                  <label htmlFor="dateReservation" className="form-label">Date</label>
                  <input type="date" className="form-control" id="dateReservation" value={dateReservation} onChange={(e) => setDateReservation(e.target.value)} required />
                </div>
                <div className="mb-3">
                  <label htmlFor="timeReservation" className="form-label">Time</label>
                  <input type="time" className="form-control" id="timeReservation" value={timeReservation} onChange={(e) => setTimeReservation(e.target.value)} required />
                </div>
                <div className="mb-3">
                  <label htmlFor="paxSize" className="form-label">Number of Guests</label>
                  <input type="number" className="form-control" id="paxSize" value={paxSize} onChange={(e) => setPaxSize(e.target.value)} required min="1" />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={onClose}>Close</button>
                <button type="submit" className="btn btn-primary">Make Reservation</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  export default ReservationModal;
  