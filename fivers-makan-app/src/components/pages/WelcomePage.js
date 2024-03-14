import React from 'react';
import { Link } from 'react-router-dom';

function WelcomePage() {
  return (
    <div>
      <h1>Welcome to Fiver's Makan</h1>
      <Link to="/login">Login to Continue</Link>
    </div>
  );
}

export default WelcomePage;