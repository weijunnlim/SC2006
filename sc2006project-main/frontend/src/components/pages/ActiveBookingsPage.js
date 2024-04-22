import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../contexts/UserContext";
import NavBar from "./NavBar";

function ActiveBookingsPage() {
  const [error, setError] = useState(null);
  const [activeReservations, setActiveReservations] = useState([]);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const { user } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchReservationData = async () => {
      try {
        const response = await fetch(
          `http://localhost:4000/api/reservation/myReservations/${user}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          const json = await response.json();
          setError(json.error);
          setActiveReservations([]);
        } else {
          const json = await response.json();

          const { upcoming_reservations } = json;
          setActiveReservations(upcoming_reservations || []);
        }
      } catch (error) {
        console.error("Error fetching reservation data:", error);
        setError("Failed to fetch reservation data");
      }
    };

    fetchReservationData();
  }, [user]);

  const handleCancel = async (reservation) => {
    const reservation_id = reservation.reservation_id;
    const isConfirmed = window.confirm(
      "Are you sure you want to cancel this reservation?"
    ); // Window alert can be changed to popup

    if (isConfirmed) {
      try {
        const response = await fetch(
          `http://localhost:4000/api/reservation/${reservation_id}`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          const json = await response.json();
          setError(json.error);
        } else {
          window.alert("Your reservation has been cancelled"); // Window alert can be changed to popup
          // Optionally, you can update the list of active reservations after cancellation
          setActiveReservations((prevReservations) =>
            prevReservations.filter(
              (res) => res.reservation_id !== reservation_id
            )
          );
        }
      } catch (error) {
        console.error("Error cancelling reservation:", error);
        setError("Failed to cancel reservation");
      }
    } else {
      console.log("Cancellation aborted.");
    }
  };

  const handleEdit = (reservation) => {
    console.log(
      "Navigating to edit page with reservation ID:",
      reservation.reservation_id
    );
    navigate(`/bookings/edit`, {
      state: { reservation_id: reservation.reservation_id },
    });
  };

  const handleClick = (reservation) => {
    // Here, you can set state to show a modal or navigate to a different component
    // For demonstration, let's assume you're setting state to open a modal
    console.log(`Booking for ${reservation.reservation_id}`);
    localStorage.setItem("reservation_id", reservation.reservation_id);
    // Set the selected restaurant for reservation
    setSelectedReservation(reservation);
  };

  return (
    <div className="activeBookingsPage">
      <NavBar />
      <div className="container my-5">
        <h1 className="text-center mb-4">Your Active Reservations</h1>
        <div className="row">
          <div className="col-12">
            {activeReservations.length > 0 ? (
              activeReservations.map((reservation, index) => (
                <div className="card mb-3" key={index}>
                  <div className="card-body">
                    {/* Frontend u need to style this */}
                    <h5 className="card-title">
                      <strong>
                        Reservation at {reservation.restaurant_name}
                      </strong>
                    </h5>
                    <p className="card-text">
                      <strong>Date: </strong>
                      {reservation.date_reservation},<strong> Time: </strong>
                      {reservation.time_reservation},
                      <strong> No of pax: </strong>
                      {reservation.pax_size}
                    </p>
                    <button
                      onClick={() => handleEdit(reservation)}
                      className="btn btn-primary me-2"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleCancel(reservation)}
                      className="btn btn-danger"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="alert alert-info" role="alert">
                No active reservations found.
              </div>
            )}
            <div className="d-flex justify-content-center mt-4">
              <button
                onClick={() => navigate("/bookings/completed")}
                className="btn btn-primary"
              >
                View Completed Reservations
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ActiveBookingsPage;
