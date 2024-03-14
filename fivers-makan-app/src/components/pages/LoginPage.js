import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/LoginPage.css';

function LoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (event) => {
    event.preventDefault();
    navigate('/home');
  };

  return (
    <div className="login-container">
      <h2 className= "header-title">Fiver's Makan</h2>
      <form onSubmit={handleLogin} className="login-form">
        <div className="form-field">
          <label>Username:</label>
          <input
            type="text"
            value={username}
            className="input-field"
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <div className="form-field">
          <label>Password:</label>
          <input
            type="password"
            value={password}
            className="input-field"
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div className="login-actions">
          <button type="submit">Login</button>
          <span className="forgot-password" onClick={() => navigate('/forgot-password')}>Forgot Password?</span>
        </div>
      </form>
      <button onClick={() => navigate('/signup')}>No Account? Sign Up</button>
    </div>
  );
}

export default LoginPage;