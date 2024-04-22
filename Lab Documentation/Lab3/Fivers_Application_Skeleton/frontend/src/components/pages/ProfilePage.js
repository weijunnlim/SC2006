import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import NavBar from "./NavBar";
import { useUser } from "../../contexts/UserContext";

function ProfilePage() {
  const { user } = useUser();
  const [error, setError] = useState(null);

  const [userDetails, setUserDetails] = useState({
    name: "",
    mobileNumber: "-",
    email: "",
    dietaryRequirements: [],
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          `http://localhost:4000/api/profile/${user}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        const json = await response.json();

        if (!response.ok) {
          setError(json.error);
        } else {
          // Jodius can refer
          setUserDetails({
            name: json.name,
            email: json.email,
            mobileNumber: json.mobileNumber,
            dietaryRequirements: json.dietaryRequirements || {},
          });
        }
      } catch (error) {
        console.log("Error", error.message);
        setError("Failed to fetch user data");
      }
    };

    fetchData();
  }, [user]);

  return (
    <>
      <NavBar />
      <div className="container-fluid rounded bg-white mt-5 mb-5">
        {error && <div className="alert alert-danger">{error}</div>}
        <div className="row">
          <div className="col-md-3 border-right">
            <div className="d-flex flex-column align-items-center text-center p-3 py-5">
              <img
                className="rounded-circle mt-5"
                width="150px"
                src="https://st3.depositphotos.com/15648834/17930/v/600/depositphotos_179308454-stock-illustration-unknown-person-silhouette-glasses-profile.jpg"
                alt="Profile"
              />
              <span className="font-weight-bold">{userDetails.name}</span>
              <span className="text-black-50">{userDetails.email}</span>
            </div>
          </div>
          <div className="col-md-9 border-right">
            <div className="p-3 py-5">
              <div className="row mt-3">
                <div className="col-md-12">
                  <label className="labels">Name</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Name"
                    value={userDetails.name}
                    readOnly
                  />
                </div>
              </div>
              <div className="row mt-3">
                <div className="col-md-12">
                  <label className="labels">Mobile Number</label>
                  <input
                    type="text"
                    className="form-control"
                    value={userDetails.mobileNumber}
                    readOnly
                  />
                </div>
                <div className="col-md-12 mt-3">
                  <label className="labels">Email Address</label>
                  <input
                    type="text"
                    className="form-control"
                    value={userDetails.email}
                    readOnly
                  />
                </div>
              </div>
              <div className="mt-3">
                <label className="labels">Dietary Requirements</label>
                <ul className="list-unstyled">
                  {Object.entries(userDetails.dietaryRequirements).map(
                    ([requirement, value]) => (
                      <p key={requirement}>
                        {value ? requirement : null}{" "}
                        {/* Display requirement if it's true */}
                      </p>
                    )
                  )}
                </ul>
              </div>
              <div className="mt-5 text-center">
                <Link to="/edit-profile" className="btn btn-primary">
                  Edit Profile
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default ProfilePage;
