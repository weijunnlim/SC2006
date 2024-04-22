import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import "../../styles/LoginPage.css";
import logoImg from '../../images/Fivers_makan_logo.png';

import { useUser } from '../../contexts/UserContext';

  function LoginPage() {
    const navigate = useNavigate();
    const [error, setError] = useState(null);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const { setUser } = useUser();

    const handleLogin = async (event) => {
      event.preventDefault();
      //I hate myself for sending the password in plaintext :skull: oh my goodness
      let login = {
        email: email, 
        password: password}

      console.log(login)

      try {
      const response = await fetch('http://localhost:4000/api/authentication/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(login)
      })

      const json = await response.json()

      if(!response.ok) {
        setError(json.error)
      }
      else{
        console.log(json)
        const userId = json.id
        localStorage.setItem('token', json.token)
        const redirectRoute = json.userType === 'patron' ? '/home' : '/restHome';
        navigate(redirectRoute);
        setUser(userId)
      }

    } catch (error) {
      console.error('Error', error.message)
    }

    };

  return (
    <section className="vh-100">
      <div className="container-fluid h-100">
        <div className="row h-100">
          <div className="col-sm-6 text-black d-flex justify-content-center align-items-center">
            {/* Adjusted styling here for centering */}
            <div style={{ width: "23rem" }}>
              <div className="px-5 ms-xl-4 text-center">
                <img src={logoImg} alt="Fiver's Makan Logo" style={{ width: '120px', height: 'auto', marginTop: '-100px' }} />
                <i className="fas fa-crow fa-2x me-3 pt-5 mt-xl-4" style={{ color: "#709085" }}></i>
                <span className="h1 fw-bold mb-0" style={{ color: "#000", whiteSpace: 'nowrap' }}>Fiver's Makan</span>
              </div>

              <form onSubmit={handleLogin}>
                <h3 className="fw-normal mb-3 pb-3" style={{ letterSpacing: "1px" }}>Log in</h3>

                <div className="form-outline mb-4">
                  <input
                    type="text"
                    id="form2Example18"
                    className="form-control form-control-lg"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div className="form-outline mb-4">
                  <input
                    type="password"
                    id="form2Example28"
                    className="form-control form-control-lg"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>

                <div className="pt-1 mb-4">
                  <button className="btn btn-info btn-lg btn-block form-btn-full-width" type="submit">Login</button>
                  {error && <p className="error-message">{error}</p>}
                </div>

                <p className="small mb-5 pb-lg-2">
                  <button 
                    className="text-muted btn btn-link" 
                    onClick={(e) => {e.preventDefault(); navigate('/forgot-password')}} 
                    style={{ padding: 0, border: 'none', background: 'none', textDecoration: 'underline' }}>
                    Forgot password?
                  </button>
                </p>
                <p className="small">Don't have an account? 
                  <span 
                    role="button" 
                    className="link-info" 
                    onClick={() => navigate('/signup')}
                    style={{ textDecoration: 'underline', cursor: 'pointer', paddingLeft: '5px' }}>
                    Register here
                  </span>
                </p>
              </form>
            </div>
          </div>
          <div className="col-sm-6 px-0 d-none d-sm-block">
            <img
              src="https://img.freepik.com/free-photo/top-view-food-banquet_23-2149893486.jpg?size=626&ext=jpg"
              alt="Fiver's Makan Cover"
              className="w-100 vh-100"
              style={{ objectFit: "cover", objectPosition: "left" }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

export default LoginPage;