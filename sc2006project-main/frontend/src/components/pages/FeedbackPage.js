import React, { useState , useEffect} from 'react';
import { useNavigate, useLocation} from 'react-router-dom';
import NavBar from "./NavBar";

const FeedbackPage = () => {
  const [rating, setRating] = useState(0);
  const [priceRange, setPriceRange] = useState('');
  const [feedback, setFeedback] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { reservation_id } = location.state || {};
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rating) {
      alert("Please select a star rating.");
      return;
    }
    if (!priceRange) {
      alert("Please select a price range.");
      return;
    }
    if (feedback.length > 250) {
      alert("Review too long. Please limit to 250 characters.");
      return;
    }
    console.log({ rating, priceRange, feedback });
    // API CALL
    try {
      const response = await fetch(`http://localhost:4000/api/review/${reservation_id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          stars_given: rating,
          review_text: feedback,
        }),
      });

      const json = await response.json();
      if (!response.ok) {
        setError(json.error);
      }
      console.log('Review submitted successfully', json);
      navigate('/bookings/completed');
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Failed to submit review. Please try again.');
    }
    navigate('/bookings/completed'); 
  };

  return (
    <div className="bookingsPage">
      <NavBar/>
      <div className="d-flex align-items-center mb-4">
        <button onClick={() => navigate('/bookings/completed')} className="btn btn-sm me-2" style={{ color: 'black' }}>
          <i className="bi bi-arrow-left"></i>
        </button>
        <h2 className="mb-0">Leave Your Review</h2>
      </div>
      <form onSubmit={handleSubmit} className="mt-4">
        <div className="mb-3">
          <p>Your Rating (Required):</p>
          <div className="btn-group" role="group" aria-label="Rating">
            {[...Array(5)].map((star, index) => {
              index += 1;
              return (
                <button
                  key={index}
                  type="button"
                  className={`btn ${index <= rating ? 'btn-warning' : 'btn-outline-warning'}`}
                  onClick={() => setRating(index)}
                >
                  &#9733;
                </button>
              );
            })}
          </div>
        </div>
        <div className="mb-3">
          <p>Price Paid per Pax (Required):</p>
          <select className="form-select" value={priceRange} onChange={(e) => setPriceRange(e.target.value)} required>
            <option value="">Select Price Range</option>
            <option value="Below SGD10">Below SGD10</option>
            <option value="SGD10 to below SGD30">SGD10 to below SGD30</option>
            <option value="SGD30 to below SGD50">SGD30 to below SGD50</option>
            <option value="SGD50 and above">SGD50 and above</option>
          </select>
        </div>
        <div className="form-group mb-3">
          <label htmlFor="feedback" className="form-label">Your Feedback (Optional, up to 250 characters):</label>
          <textarea
            className="form-control"
            id="feedback"
            rows="3"
            maxLength="250" //sets max to 250 characters
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Tell us more..."
          ></textarea>
        </div>
        <button type="submit" className="btn btn-primary">Submit Review</button>
      </form>
    </div>
  );
};

export default FeedbackPage;
