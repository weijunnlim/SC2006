import React, { useState, useEffect } from 'react';
import Navbar2 from "./NavBar2";
import { useUser } from '../../contexts/UserContext';

const sortBy = {
  LATEST: (a, b) => new Date(b.date_added._seconds * 1000) - new Date(a.date_added._seconds * 1000),
  OLDEST: (a, b) => new Date(a.date_added._seconds * 1000) - new Date(b.date_added._seconds * 1000),
  HIGHEST: (a, b) => b.stars_given - a.stars_given,
  LOWEST: (a, b) => a.stars_given - b.stars_given,
};

const RestaurantReviewsPage = () => {
  const [reviews, setReviews] = useState([]);
  const [sortOrder, setSortOrder] = useState('LATEST');
  const { user } = useUser();
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReviewData = async () => {
      try {
        const response = await fetch(`http://localhost:4000/api/review/allReviews/${user}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          const json = await response.json();
          setError(json.error);
          setReviews([]);
        } else {
          const json = await response.json();
          setReviews(json);
          console.log(json);
        }
      } catch (error) {
        console.error('Error fetching review data:', error);
        setError("Failed to fetch review data");
      }
    };

    fetchReviewData();
  }, [user]);

  useEffect(() => {
    // Sort reviews whenever sortOrder changes or new reviews are fetched
    setReviews(prevReviews => [...prevReviews].sort(sortBy[sortOrder]));
  }, [sortOrder]);

  const handleSortChange = (event) => {
    setSortOrder(event.target.value);
  };

  const handleReplyChange = (id, reply) => {
    // Here you would update the reply in your backend
    const updatedReviews = reviews.map(review => {
      if (review.id === id) {
        return { ...review, reply };
      }
      return review;
    });
    setReviews(updatedReviews);
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

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp._seconds * 1000); // Convert seconds to milliseconds
    const options = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
      timeZoneName: 'short'
    };
    return date.toLocaleString('en-US', options);
  };

  return (
    <>
      <Navbar2 />
      <div className="container mt-4">
        <h2>Restaurant Reviews</h2>
        <div className="mb-3">
          <select className="form-select" value={sortOrder} onChange={handleSortChange}>
            <option value="LATEST">Most Recent</option>
            <option value="OLDEST">Least Recent</option>
            <option value="HIGHEST">Highest Rating</option>
            <option value="LOWEST">Lowest Rating</option>
          </select>
        </div>
        <div>
          {reviews.map((review, index) => (
            <div key={review.id || index} className="card mb-3">
              <div className="card-body">
                <h5 className="card-title">{review.patron_name} - {renderStars(review.stars_given)}</h5>
                <h6 className="card-subtitle mb-2 text-muted">{formatDate(review.date_added)}</h6>
                <p className="card-text">Text: "{review.review_text}"</p>
                <textarea 
                  className="form-control" 
                  placeholder="Reply to this review" 
                  value={review.reply}
                  onChange={(e) => handleReplyChange(review.id, e.target.value)}
                />
                <button className="btn btn-primary mt-2" onClick={() => {/* Function to submit reply */}}>Post Reply</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default RestaurantReviewsPage;