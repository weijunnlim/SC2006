import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import NavBar from "./NavBar";
import { useUser } from "../../contexts/UserContext";

const dietaryOptions = [
  "None",
  "Halal",
  "Vegetarian"
];

function EditProfilePage() {
  const { user } = useUser();
  const [formData, setFormData] = useState({
    name: "",
    mobileNumber: "",
    dietaryRequirements: {
      None: false,
      Halal: false,
      Vegetarian: false
    },
    userType: "patron",
  });
  const [mobileNumberError, setmobileNumberError] = useState("");
  const [photo, setPhoto] = useState(null);
  const [photoUrl, setPhotoUrl] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [profileUpdated, setProfileUpdated] = useState(false);

  const validatemobileNumber = (mobileNumber) => {
    const sgmobileNumberPattern = /^[89]\d{7}$/; /* 8 or 9 for sg number */
    return sgmobileNumberPattern.test(mobileNumber);
  };

  const handleChangemobileNumber = (e) => {
    const { value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      mobileNumber: value,
    }));

    if (formData.userType === "patron") {
      const isValidmobileNumber = validatemobileNumber(value);
      setmobileNumberError(isValidmobileNumber ? "" : "Invalid phone number");
    }
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      dietaryRequirements: {
        ...prevData.dietaryRequirements,
        [name]: checked,
      },
    }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    setPhoto(file);
    setPhotoUrl(URL.createObjectURL(file));
  };

  const uploadPhoto = async () => {
    const formData = new FormData();
    formData.append("photo", photo);

    try {
      const response = await fetch("/api/upload-photo", {
        method: "POST",
        body: formData,
      });
      if (response.ok) {
        console.log("Photo uploaded successfully");
      } else {
        console.error("Failed to upload photo");
      }
    } catch (error) {
      console.error("Error uploading photo:", error);
    }
  };

  const saveProfile = async () => {
    try {
      const response = await fetch(
        `http://localhost:4000/api/profile/${user}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );
      if (response.ok) {
        setSuccessMessage("Profile updated successfully");
        setErrorMessage("");
        setProfileUpdated(true);
      } else {
        const responseData = await response.json();
        setSuccessMessage("");
        setErrorMessage(responseData.error || "Failed to update profile");
        setProfileUpdated(false);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      setSuccessMessage("");
      setErrorMessage("Error updating profile. Please try again later.");
      setProfileUpdated(false);
    }
  };

  useEffect(() => {
    // Fetch existing profile data when the component mounts
    const fetchProfileData = async () => {
      try {
        const response = await fetch(
          `http://localhost:4000/api/profile/${user}`
        );
        if (response.ok) {
          const profileData = await response.json();
          setFormData(profileData);
        } else {
          console.error("Failed to fetch profile data");
        }
      } catch (error) {
        console.error("Error fetching profile data:", error);
      }
    };

    fetchProfileData();
  }, [user]);

  const { name, mobileNumber, dietaryRequirements, userType } = formData;

  return (
    <>
      <NavBar />
      <div className="container-fluid rounded bg-white mt-5 mb-5">
        <div className="row">
          <div className="col-md-3 border-right">
            <div className="d-flex flex-column align-items-center text-center p-3 py-5">
              <img
                className="rounded-circle mt-5"
                width="150px"
                src={
                  photoUrl ||
                  "https://st3.depositphotos.com/15648834/17930/v/600/depositphotos_179308454-stock-illustration-unknown-person-silhouette-glasses-profile.jpg"
                }
                alt="Profile"
              />
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
              />
              <button onClick={uploadPhoto}>Upload Photo</button>
            </div>
          </div>
          <div className="col-md-9 border-right">
            <div className="p-3 py-5">
              <div className="row mt-3">
                <div className="col-md-12 mt-3">
                  <label className="labels">Name</label>
                  <input
                    type="text"
                    className="form-control"
                    name="name"
                    placeholder="Enter name"
                    value={name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                  />
                </div>
                <div className="col-md-12 mt-3">
                  <label className="labels">Mobile Number</label>
                  <input
                    type="text"
                    className="form-control"
                    name="mobileNumber"
                    placeholder="Phone Number (e.g., 81234567)"
                    value={mobileNumber}
                    onChange={handleChangemobileNumber}
                  />
                  {mobileNumberError && (
                    <p className="error-message">{mobileNumberError}</p>
                  )}
                </div>
              </div>
              {userType === "patron" && (
                <div>
                  <label className="labels">Dietary Requirements</label>
                  {Object.entries(dietaryRequirements).map(
                    ([req, value], index) => (
                      <div key={index} className="form-check">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          id={`checkbox-${index}`}
                          name={req}
                          checked={value}
                          onChange={handleCheckboxChange}
                        />
                        <label
                          className="form-check-label"
                          htmlFor={`checkbox-${index}`}
                        >
                          {req}
                        </label>
                      </div>
                    )
                  )}
                </div>
              )}
              <div className="mt-5 text-center">
                <div className="d-flex justify-content-between">
                  <Link to="/changepassword" className="btn btn-primary">
                    Change Password
                  </Link>
                  {profileUpdated && (
                    <Link to="/profile" className="btn btn-primary">
                      Go to Profile
                    </Link>
                  )}
                  <button className="btn btn-primary" onClick={saveProfile}>
                    Save Profile
                  </button>
                </div>
                {successMessage && (
                  <p className="text-success">{successMessage}</p>
                )}
                {errorMessage && <p className="text-danger">{errorMessage}</p>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default EditProfilePage;
