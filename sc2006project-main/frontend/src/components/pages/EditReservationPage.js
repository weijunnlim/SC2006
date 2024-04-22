// Done : might need styling
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation} from "react-router-dom";
import NavBar from "./NavBar";

function EditReservationPage() {
  
  const navigate = useNavigate();
  const location = useLocation();
  const { reservation_id } = location.state || {};

  const [error, setError] = useState(null);
  const [formFields, setFormFields] = React.useState({
    restaurant_name: '',
    date_reservation: '',
    pax_size: '',
    time_reservation: '',   
  });
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormFields(prevState => ({
      ...prevState,
      [name]: value,
    }));
  };

  console.log(reservation_id)

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { date_reservation, pax_size, time_reservation } = formFields;
    try {
      const response = await fetch(`http://localhost:4000/api/reservation/${reservation_id}`, {
          method: 'PATCH',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            date_reservation, 
            pax_size, 
            time_reservation
          }),
      });

      const json = await response.json();

      if (!response.ok) {
        setError(json.error);
      }

      console.log('Successfully updated reservation', json);
      navigate('/bookings/active'); // Redirect or handle success as needed
  } catch (error) {
      console.error('There was an issue updating your reservation:', error);
  }
  };

  //to fetch reserveration current details to show in form
  useEffect(() => {
    const fetchReservationData = async () => {
      try {
        const response = await fetch(`http://localhost:4000/api/reservation/${reservation_id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        const json = await response.json();
        if (!response.ok) {
          setError(json.error);
        } else {
          setFormFields({
            restaurant_name: json.reservation_data.restaurant_name, 
            date_reservation: json.reservation_data.date_reservation,
            pax_size: json.reservation_data.pax_size,
            time_reservation: json.reservation_data.time_reservation,
          });
        }
      } catch (error) {
        console.error('Error fetching reservation data:', error);
        setError("Failed to fetch reservation data");
      }
    };

    fetchReservationData();
  }, [reservation_id]);

  return (
    <div className = "bookingsPage">
    <NavBar/>
      <div className="d-flex align-items-center mb-4">
        <button onClick={() => navigate('/bookings/active')} className="btn btn-sm me-2" style={{ color: 'black' }}>
          <i className="bi bi-arrow-left"></i>
        </button>
        <h2 className="mb-0">Editing Reservation of {formFields.restaurant_name}</h2>
      </div>


      <form onSubmit={handleSubmit} className="mt-4">
        <div className="form-group mb-3">
          <h3 className="mb-3">{formFields.restaurant_name}</h3>
        </div>
        <div className="form-group mb-3">
          <label htmlFor="date" className="form-label">Date</label>
          <input
            type="date"
            className="form-control"
            id="date_reservation"
            name="date_reservation"
            value={formFields.date_reservation}
            onChange={handleChange}
          />
        </div>
        <div className="form-group mb-3">
          <label htmlFor="pax" className="form-label">Number of Pax</label>
          <input
            type="number"
            className="form-control"
            id="pax_size"
            name="pax_size"
            value={formFields.pax_size}
            onChange={handleChange}
          />
        </div>
        <div className="form-group mb-3">
          <label htmlFor="time" className="form-label">Time</label>
          <input
            type="time"
            className="form-control"
            id="time_reservation"
            name="time_reservation"
            value={formFields.time_reservation}
            onChange={handleChange}
          />
        </div>
        <button type="submit" className="btn btn-primary">Save Changes</button>
      </form>
    </div>
  );
}

export default EditReservationPage;
