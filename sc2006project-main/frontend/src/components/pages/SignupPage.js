import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/SignupPage.css';
import logoImg from '../../images/fivers.png';

function SignupPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    // username: '',
    email: '',
    // fullName: '',
    password: '',
    confirmPassword: '',
    userType: '',
    // restaurantAddress: '',
    // restaurantName: ''
  });

  // const [phoneNumberError, setPhoneNumberError] = useState('');
  const [error, setError] = useState(null);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  
  //This is to manage the user inputs
  const handleChange = (e) => {
    const { name, value, options } = e.target;
    
    if (name === 'dietaryRequirements' && e.target.multiple) {
      const selectedOptions = Array.from(options).filter(option => option.selected).map(option => option.value);
      setFormData(prevState => ({
        ...prevState,
        [name]: selectedOptions,
      }));
    } else {
      setFormData(prevState => ({
        ...prevState,
        [name]: value,
      }));
    }
  };

  //to submit to backend
  const handleSubmit = async (e) => {
    e.preventDefault(); //prevent page-refresh
    setError('');

      const requestBody = {
        // username: formData.username,
        userType: formData.userType,
        email: formData.email,
        password: formData.password, //DO NOT DO THIS IN THE FUTURE
        confirmPassword : formData.confirmPassword //DO NOT DO THIS IN THE FUTURE
      }
    try{
      const response = await fetch('http://localhost:4000/api/authentication/registerUser', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      })

      const json = await response.json()
      if (response.ok) {
        console.log("Registration successful. Showing popup.");
        setShowSuccessPopup(true);
        setTimeout(() => {
          navigate('/');
        }, 3000);
      } else {
        setError(json.error);
      }
      
    } catch (error)
    {
      console.error('Error signing up:', error.message);
    }
  };

  useEffect(() => {
    let timer;
    if (showSuccessPopup) {
      timer = setTimeout(() => {
        setShowSuccessPopup(false);
      }, 3000); // Hide popup after 3 seconds
    }
    return () => clearTimeout(timer); // Clean up the timer
  }, [showSuccessPopup]);
  

  return (
    <section className="vh-100">
      <div className="container-fluid h-100">
        <div className="row h-100">
          <div className="col-sm-6 text-black d-flex justify-content-center align-items-center">
            {/* Adjusted styling here for centering */}
            <div style={{ width: "23rem" }}>
              <div className="px-5 ms-xl-4 text-center">
                <img src={logoImg} alt="Fiver's Makan Logo" style={{ width: '240px', height: 'auto', marginTop: '-100px' }} />
                <i className="fas fa-crow fa-2x me-3 pt-5 mt-xl-4" style={{ color: "#709085" }}></i>
                <span className="h1 fw-bold mb-0" style={{ color: "#000", whiteSpace: 'nowrap' }}>Fiver's Makan</span>
              </div>

              <form onSubmit={handleSubmit}>
                <h3 className="fw-normal mb-3 pb-3" style={{ letterSpacing: "1px" }}>Signing up</h3>

                {/* User Type Selection */}
                <select name="userType" value={formData.userType} onChange={handleChange} className="user-type-select" style={{ width: '330px'}}>
                  <option value="" disabled>Select user type</option>
                  <option value="patron">Patron</option>
                  <option value="restaurantOwner">Restaurant Owner</option>
                  
                </select>

                <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} />
                <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} />
                <input type="password" name="confirmPassword" placeholder="Confirm Password" value={formData.confirmPassword} onChange={handleChange} />

                {error && <p className="error-message">{error}</p>}
                <div className="pt-1 mb-4">
                  <button className="btn btn-info btn-lg btn-block form-btn-full-width" type="submit">Register</button>
                </div>
                <div className="login-prompt">
                  <span>Already have an account? </span>
                  <button type="button" onClick={() => navigate('/')} className="login-button">Login</button>
                </div>
              </form>
            </div>
          </div>
          <div className="col-sm-6 px-0 d-none d-sm-block">
            <img
              src="https://img.freepik.com/free-photo/top-view-food-banquet_23-2149893486.jpg?size=626&ext=jpg"
              alt="Fiver's Makan Cover"
              className="w-100 vh-100"
              style={{objectFit: "cover", objectPosition: "left"}}
            />
          </div>
        </div>
      </div>
      {showSuccessPopup && (
        <div className="success-popup">
          Registration successful!
        </div>
      )}
    </section>
  );
}



export default SignupPage;