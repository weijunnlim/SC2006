import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import NavBar from "./NavBar";

function ChangePassword() {
  const [formData, setFormData] = useState({
    name: "John",
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
    userType: "patron",
  });

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSavePassword = () => {
    if (formData.oldPassword === "") {
      setError("Please enter your old password.");
    } else if (formData.newPassword === "" || formData.confirmPassword === "") {
      setError("Please enter both the new password and confirm password.");
    } else if (formData.newPassword !== formData.confirmPassword) {
      setError("New password and confirm password do not match.");
    } else {
      setError("");
      setSuccessMessage("Password successfully changed.");
      setFormData({
        ...formData,
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setTimeout(() => {
        setSuccessMessage("");
        navigate("/profile");
      }, 3000);
    }
  };

  const { oldPassword, newPassword, confirmPassword } = formData;

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
                src="https://st3.depositphotos.com/15648834/17930/v/600/depositphotos_179308454-stock-illustration-unknown-person-silhouette-glasses-profile.jpg"
                alt="Profile"
              />
              <span className="font-weight-bold">
                {formData.name} {formData.surname}
              </span>
              <span className="text-black-50">{formData.emailAddress}</span>
            </div>
          </div>
          <div className="col-md-9 border-right">
            <div className="p-3 py-5">
              <div className="row mt-2">
                <div className="col-md-12">
                  <label className="labels">Old Password</label>
                  <input
                    type="password"
                    className="form-control"
                    name="oldPassword"
                    placeholder="Enter old password"
                    value={oldPassword}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="row mt-3">
                <div className="col-md-12">
                  <label className="labels">New Password</label>
                  <input
                    type="password"
                    className="form-control"
                    name="newPassword"
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="row mt-3">
                <div className="col-md-12">
                  <label className="labels">Confirm Password</label>
                  <input
                    type="password"
                    className="form-control"
                    name="confirmPassword"
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={handleChange}
                  />
                </div>
              </div>
              {error && <div className="text-danger mt-2">{error}</div>}
              {successMessage && (
                <div className="text-success mt-2">{successMessage}</div>
              )}
              <div className="mt-5 text-center">
                <div className="d-flex justify-content-between">
                  <Link
                    to="/edit-profile"
                    className="btn btn-primary btn-block profile-btn"
                  >
                    Back
                  </Link>
                  <button
                    className="btn btn-primary btn-block profile-btn"
                    onClick={handleSavePassword}
                  >
                    Save Password
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default ChangePassword;
