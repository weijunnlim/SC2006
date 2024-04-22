import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../contexts/UserContext';
import NavBar from "./NavBar";


function CompletedBookingsPage() {
  const [error, setError] = useState(null);
  const [reviews, setReviews] = useState({});
  const [completedReservations, setCompletedReservations] = useState([]);
  const { user } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchReservationData = async () => {
      try {
        const response = await fetch(`http://localhost:4000/api/reservation/myReservations/${user}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          const json = await response.json();
          setError(json.error);
        } else {
          const json = await response.json();
          setCompletedReservations(json.past_reservations)

          json.past_reservations.forEach(async (reservation) => {
            if (reservation.feedback_status === 'given') {
              try {
                const reviewResponse = await fetch(`http://localhost:4000/api/review/${reservation.reservation_id}_rvW`, {
                  method: "GET",
                  headers: {
                    'Content-Type': 'application/json',
                  },
                });

                if (!reviewResponse.ok) {
                  throw new Error('Failed to fetch review');
                }

                const reviewData = await reviewResponse.json();
                setReviews(prevReviews => ({
                  ...prevReviews,
                  [reservation.reservation_id]: reviewData.review_data
                }));
              } catch (error) {
                console.error('Error fetching review data:', error);
              }
            }
          });
        }
      } catch (error) {
        console.error('Error fetching reservation data:', error);
        setError("Failed to fetch reservation data");
      }
    };
    fetchReservationData();
  }, [user]);

  const handleFeedback = (reservation) => {
    console.log("Navigating to provide feedback with reservation ID:", reservation.reservation_id);
    navigate(`/bookings/feedback`, { state: { reservation_id: reservation.reservation_id } });
  };

  //function to display stars
  const renderStars = (stars) => {
    if (!stars) return null;
    let starsHtml = [];
    for (let i = 0; i < stars; i++) {
      starsHtml.push(<i className="bi bi-star-fill text-warning" key={i}></i>);
    }
    return starsHtml;
  };


  return (
    <div className="completedReservationsPage">
      <NavBar />
      <div className="container my-5">
        <h1 className="text-center mb-4">Fiver's Completed Reservations</h1>
        <div className="row">
          {completedReservations.length > 0 ? (
            completedReservations.map((reservation) => (
              <div className="col-12 mb-3" key={reservation.id}>
                <div className="card">
                  <div className="card-body">
                    <div className="d-flex justify-content-between">
                      <h5 className="card-title"><strong>Reservation completed at {reservation.restaurant_name}</strong></h5>
                      {reservation.feedback_status === "given" ? (
                        <span className="badge bg-success" style={{ fontSize: '12px', padding: '6px 6px' }}>Feedback Given</span>
                      ) : (
                        <span className="badge bg-danger" style={{ fontSize: '12px', padding: '6px 6px' }}>Feedback Pending</span>
                      )}
                    </div>
                    <p className="card-text">
                    <strong>Date: </strong>{reservation.date_reservation},
                    <strong> Time: </strong>{reservation.time_reservation},
                    <strong> No of pax: </strong>{reservation.pax_size}
                    </p>
                    {reservation.feedback_status === "given" && reviews[reservation.reservation_id] ? (
                      <>
                      {/* Pass in the review parameter to the render star function and the text function isntead of hi */}
                      <p className="card-text">Stars: {renderStars(reviews[reservation.reservation_id].stars_given)}</p>
                      <p className="card-text">You said: <em>"{reviews[reservation.reservation_id].review_text}"</em></p>
                      <button onClick={() => handleFeedback(reservation)} className="btn btn-primary mt-2">
                        Edit Feedback
                      </button>
                      </>
                    ) : (
                      <button onClick={() => handleFeedback(reservation)} className="btn btn-success mt-2">
                        Give Feedback
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="alert alert-warning" role="alert">
              No completed reservations found.
            </div>
          )}
        </div>
        <div className="d-flex justify-content-center mt-4">
          <button onClick={() => navigate('/bookings/active')} className="btn btn-primary">Back to Active Reservations</button>
        </div>
      </div>
    </div>
  );
}


export default CompletedBookingsPage;