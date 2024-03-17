import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/SignupPage.css';
import { auth, db } from '../../database/firebaseConfig';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

function SignupPage() {
  const navigate = useNavigate();
  const [userType, setUserType] = useState('');
  const [isUserTypeSelected, setIsUserTypeSelected] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
    dietaryRequirements: [],
    meatRestrictionsDetails: '', 
    userType: '',
  });

  const [phoneNumberError, setPhoneNumberError] = useState('');
  const [error, setError] = useState('');

  const validatePhoneNumber = (phoneNumber) => {
    const sgPhoneNumberPattern = /^[89]\d{7}$/;  /* 8 or 9 for sg number */
    return sgPhoneNumberPattern.test(phoneNumber);
  };
  const handleUserTypeChange = (e) => {
    setUserType(e.target.value);
    setIsUserTypeSelected(true);
  };

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!validatePhoneNumber(formData.phoneNumber)) {
      setPhoneNumberError("Invalid phone number");
      return;
    }
    try {
      const userCredential = await auth.createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;
      // Store user details in Firestore, including dietary requirements and phone number
      await setDoc(doc(db, 'users', user.uid), {
        username: formData.username,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        dietaryRequirements: formData.dietaryRequirements,
        meatRestrictionsDetails: formData.meatRestrictionsDetails,
        userType: formData.userType,
      });
      navigate('/');
    } catch (firebaseError) {
      setError(firebaseError.message);
      console.error("Error signing up:", firebaseError.message);
    }
  };

  return (
    <div className="signup-container">
      <h2>Signing Up</h2>
      <form onSubmit={handleSubmit}>
        <select name="userType" value={formData.userType} onChange={handleChange} className="user-type-select">
          <option value="" disabled>Select user type</option>
          <option value="patron">Patron</option>
          <option value="restaurantOwner">Restaurant Owner</option>
        </select>
      {formData.userType === 'patron' ? (
          <>
            <input type="text" name="username" placeholder="Username" value={formData.username} onChange={handleChange} />
            <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} />
            <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} />
            <input type="password" name="confirmPassword" placeholder="Confirm Password" value={formData.confirmPassword} onChange={handleChange} />
            <input type="text" name="phoneNumber" placeholder="Phone Number(eg. 81234567, no space)" value={formData.phoneNumber} onChange={handleChange} />
            {error && <p className ="error-message">{error}</p>}
            {phoneNumberError && <p className = "error-message">{phoneNumberError}</p>}
            <select name="dietaryRequirements" value={formData.dietaryRequirements} onChange={handleChange} multiple className ="multi-select">
              <option value="" disabled>Select Dietary Requirement(hold cntrl)</option>
              <option value="Halal">Halal food</option>
              <option value="Vegetarian">Vegetarian food</option>
              <option value="GlutenFree">Gluten-free</option>
              <option value="MeatRestrictions">Certain meat restrictions (Please specify)</option>
            </select>
            {formData.dietaryRequirements == 'MeatRestrictions' && (
              <input 
                type="text" 
                name="meatRestrictionsDetails" 
                placeholder="Please specify meat restrictions" 
                value={formData.meatRestrictionsDetails} 
                onChange={handleChange} 
              />
            )}
            </>
          ) : formData.userType === 'restaurantOwner' ? (
            <input type="text" value="Hi" readOnly />
          ) : null } 
        
        <button type="submit">Register</button>
      </form>
    </div>
  );
}

export default SignupPage;