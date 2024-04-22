import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom"; // Import Link from react-router-dom
import { useUser } from "../../contexts/UserContext";

function EditRestaurantProfilePage() {
  const { user } = useUser();
  const [restaurantDetails, setRestaurantDetails] = useState({
    name: "",
    mobileNumber: "",
    emailAddress: "",
    dietaryTypes: [],
    address: "",
  });
  const [successMessage, setSuccessMessage] = useState("");
  const [redirectTimer, setRedirectTimer] = useState(null);
  const [phoneNumberError, setPhoneNumberError] = useState("");
  const [selectedDietaryTypes, setSelectedDietaryTypes] = useState([]);

  const validatePhoneNumber = (phoneNumber) => {
    const sgPhoneNumberPattern = /^[89]\d{7}$/; /* 8 or 9 for sg number */
    return sgPhoneNumberPattern.test(phoneNumber);
  };

  const handleInputChange = (e, field) => {
    const { value } = e.target;
    setRestaurantDetails((prevDetails) => ({
      ...prevDetails,
      [field]: value,
    }));

    if (field === "mobileNumber") {
      const isValidPhoneNumber = validatePhoneNumber(value);
      setPhoneNumberError(isValidPhoneNumber ? "" : "Invalid phone number");
    }
  };

  const handleCheckboxChange = (type) => {
    if (selectedDietaryTypes.includes(type)) {
      setSelectedDietaryTypes(
        selectedDietaryTypes.filter((item) => item !== type)
      );
    } else {
      setSelectedDietaryTypes([...selectedDietaryTypes, type]);
    }
  };

  const handleSaveChanges = async () => {
    try {
      const response = await fetch(`/api/profile/restaurantProfile/${user}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...restaurantDetails,
          dietaryTypes: selectedDietaryTypes,
        }),
      });
      if (response.ok) {
        setSuccessMessage("Profile updated successfully");
        setRedirectTimer(
          setTimeout(() => {
            window.location.href = "/restProfile";
          }, 2000)
        );
      } else {
        console.error("Failed to update restaurant details");
      }
    } catch (error) {
      console.error("Error updating restaurant details:", error);
    }
  };

  useEffect(() => {
    return () => {
      if (redirectTimer) {
        clearTimeout(redirectTimer);
      }
    };
  }, [redirectTimer]);

  const handleAddressClick = () => {
    window.location.href = "/addressPage";
  };

  return (
    <>
      <div className="container-fluid p-0">
        <div className="row">
          <div className="col-md-12">
            <div className="bg-white p-4">
              <h5 className="text-center mb-4">Edit Restaurant Profile</h5>
              <div className="row">
                <div className="col-md-12">
                  {successMessage && (
                    <div className="alert alert-success" role="alert">
                      {successMessage}
                    </div>
                  )}
                  <div className="mb-3">
                    <label htmlFor="name" className="form-label">
                      Name
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="name"
                      value={restaurantDetails.name}
                      onChange={(e) => handleInputChange(e, "name")}
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="mobileNumber" className="form-label">
                      Mobile Number
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="mobileNumber"
                      value={restaurantDetails.mobileNumber}
                      onChange={(e) => handleInputChange(e, "mobileNumber")}
                    />
                    {phoneNumberError && (
                      <p className="error-message">{phoneNumberError}</p>
                    )}
                  </div>
                  <div className="mb-3">
                    <label htmlFor="emailAddress" className="form-label">
                      Email Address
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="emailAddress"
                      value={restaurantDetails.emailAddress}
                      onChange={(e) => handleInputChange(e, "emailAddress")}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Dietary Types Offered</label>
                    {restaurantDetails.dietaryTypes.map((type, index) => (
                      <div key={index} className="form-check">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          id={`dietaryType-${index}`}
                          value={type}
                          checked={selectedDietaryTypes.includes(type)}
                          onChange={() => handleCheckboxChange(type)}
                        />
                        <label
                          className="form-check-label"
                          htmlFor={`dietaryType-${index}`}
                        >
                          {type}
                        </label>
                      </div>
                    ))}
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Address</label>
                    <input
                      type="text"
                      className="form-control"
                      value={restaurantDetails.address}
                      readOnly={true}
                    />
                    <div className="d-flex align-items-center mb-3">
                      <button
                        className="btn btn-primary"
                        onClick={handleAddressClick}
                      >
                        Edit Address
                      </button>
                    </div>
                    <div className="d-flex justify-content-between">
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={handleSaveChanges}
                      >
                        Save Changes
                      </button>
                      <Link to="/restProfile" className="btn btn-primary">
                        Cancel
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default EditRestaurantProfilePage;
