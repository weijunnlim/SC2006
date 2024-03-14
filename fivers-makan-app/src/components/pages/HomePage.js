import React from 'react';
import { Link } from 'react-router-dom';

function HomePage() {
  return (
    <div>
      <h1>Welcome to Fiver's Makan</h1>
      <ul>
        <li><Link to="/search">Search Page</Link></li>
        <li><Link to="/favourites">Favourites Page</Link></li>
        <li><Link to="/bookings">Bookings Page</Link></li>
        <li><Link to="/profile">Profile Page</Link></li>
      </ul>
    </div>
  );
}

export default HomePage;