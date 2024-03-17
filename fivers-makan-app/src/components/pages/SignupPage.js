import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/SignupPage.css';

function SignupPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
    dietaryRequirements: '',
    meatRestrictionsDetails: '', 
    userType: ' ',
  });

  const [phoneNumberError, setPhoneNumberError] = useState('');

  const validatePhoneNumber = (phoneNumber) => {
    const sgPhoneNumberPattern = /^[89]\d{7}$/;  /* 8 or 9 for sg number */
    return sgPhoneNumberPattern.test(phoneNumber);
  };


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Implement sign-up logic here
    if (!validatePhoneNumber(formData.phoneNumber)) {
      setPhoneNumberError("Invalid phone number");
      return;
    }
    setPhoneNumberError("");
    console.log(formData);
    navigate('/'); 
  };

  return (
    <div className="signup-container">
      <h2>Signing Up</h2>
      <form onSubmit={handleSubmit}>
        <input type="text" name="username" placeholder="Username" value={formData.username} onChange={handleChange} />
        <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} />
        <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} />
        <input type="password" name="confirmPassword" placeholder="Confirm Password" value={formData.confirmPassword} onChange={handleChange} />
        <input type="text" name="phoneNumber" placeholder="Phone Number(eg. 81234567, no space)" value={formData.phoneNumber} onChange={handleChange} />
        {phoneNumberError && <p className = "error-message">{phoneNumberError}</p>}
        <select name="dietaryRequirements" value={formData.dietaryRequirements} onChange={handleChange}>
          <option value="">Select Dietary Requirement</option>
          <option value="Halal">Halal food</option>
          <option value="Vegetarian">Vegetarian food</option>
          <option value="GlutenFree">Gluten-free</option>
          <option value="MeatRestrictions">Certain meat restrictions (Please specify)</option>
        </select>

        {formData.dietaryRequirements === 'MeatRestrictions' && (
          <input 
            type="text" 
            name="meatRestrictionsDetails" 
            placeholder="Please specify meat restrictions" 
            value={formData.meatRestrictionsDetails} 
            onChange={handleChange} 
          />
        )}
        
        <button type="submit">Register</button>
      </form>
    </div>
  );
}

export default SignupPage;