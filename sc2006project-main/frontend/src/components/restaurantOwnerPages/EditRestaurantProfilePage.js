import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useUser } from "../../contexts/UserContext";
import NavBar2 from "./NavBar2";

function EditRestaurantProfilePage() {
  const { user } = useUser();
  const [restaurantDetails, setRestaurantDetails] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [selectedDietaryRestrictions, setSelectedDietaryRestrictions] =
    useState({
      Vegetarian: false,
      Halal: false,
    });
  const [showGoToProfileButton, setShowGoToProfileButton] = useState(false);

  const handleInputChange = (e, field) => {
    const { value } = e.target;
    setRestaurantDetails((prevDetails) => ({
      ...prevDetails,
      [field]: value,
    }));
  };

  const handleCheckboxChange = (type) => {
    setSelectedDietaryRestrictions((prevRestrictions) => ({
      ...prevRestrictions,
      [type]: !prevRestrictions[type],
    }));
  };

  const handleSaveChanges = async () => {
    try {
      const dietaryRestrictions = {
        Halal: selectedDietaryRestrictions.Halal || false,
        Vegetarian: selectedDietaryRestrictions.Vegetarian || false,
      };

      const requestBody = {
        Name: restaurantDetails.Name,
        dietaryRestrictions: dietaryRestrictions,
      };

      const response = await fetch(
        `http://localhost:4000/api/profile/restaurantProfile/${user}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        }
      );

      if (response.ok) {
        setSuccessMessage("Profile updated successfully");
        setShowGoToProfileButton(true);
        setTimeout(() => {
          setShowGoToProfileButton(false);
        }, 3000);
      } else {
        console.error("Failed to update restaurant details");
      }
    } catch (error) {
      console.error("Error updating restaurant details:", error);
    }
  };

  useEffect(() => {
    const fetchRestaurantProfile = async () => {
      try {
        const response = await fetch(
          `http://localhost:4000/api/profile/restaurantProfile/${user}`
        );
        if (response.ok) {
          const profileData = await response.json();
          setRestaurantDetails(profileData);
          const initialSelectedRestrictions = {
            Halal: profileData.dietaryRestrictions.Halal || false,
            Vegetarian: profileData.dietaryRestrictions.Vegetarian || false,
          };
          setSelectedDietaryRestrictions(initialSelectedRestrictions);
        } else {
          console.error("Failed to fetch restaurant profile data");
        }
      } catch (error) {
        console.error("Error fetching restaurant profile data:", error);
      }
    };

    fetchRestaurantProfile();
  }, [user]);

  const handleAddressClick = () => {
    window.location.href = "/addressPage";
  };

  return (
    <>
      <NavBar2 />
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
                      value={restaurantDetails.Name || ""}
                      onChange={(e) => handleInputChange(e, "Name")}
                      placeholder="Enter Restaurant Name"
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Dietary Types Offered</label>
                    <div>
                      {Object.entries(selectedDietaryRestrictions).map(
                        ([type, isChecked]) => (
                          <div className="form-check" key={type}>
                            <input
                              type="checkbox"
                              className="form-check-input"
                              id={`dietaryType-${type.toLowerCase()}`}
                              checked={isChecked}
                              onChange={() => handleCheckboxChange(type)}
                            />
                            <label
                              className="form-check-label"
                              htmlFor={`dietaryType-${type.toLowerCase()}`}
                            >
                              {type}
                            </label>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Address</label>
                    <input
                      type="text"
                      className="form-control"
                      value={restaurantDetails.Address || ""}
                      readOnly={true}
                      placeholder={restaurantDetails.Address || ""}
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
                      {showGoToProfileButton && (
                        <Link to="/restProfile" className="btn btn-primary">
                          Go to Profile
                        </Link>
                      )}
                      <Link to="/restProfile" className="btn btn-primary">
                        Cancel
                      </Link>
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={handleSaveChanges}
                      >
                        Save Changes
                      </button>
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
