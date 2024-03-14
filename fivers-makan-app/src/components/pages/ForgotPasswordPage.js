import React from 'react';
import { Link } from 'react-router-dom';

function ForgotPasswordPage() {
  return (
    <div>
      <h2>Forgot Password</h2>
      {/* Insert your forgot password form or instruction here */}
      <Link to="/">Back to Login</Link>
    </div>
  );
}

export default ForgotPasswordPage;