import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import NavBar2 from "./NavBar2";
import { useUser } from "../../contexts/UserContext";

function RestaurantProfilePage() {
  const { user } = useUser();
  const [restaurantDetails, setRestaurantDetails] = useState({
    name: "",
    mobileNumber: "",
    email: "",
    dietaryTypes: [],
    address: "",
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          `http://localhost:4000/api/profile/restaurantProfile/${user}`,
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
          setRestaurantDetails({
            name: json.Name,
            mobileNumber: json.mobileNumber,
            email: json.email,
            dietaryTypes: json.dietaryRequirements || [],
            address: json.Address,
          });
        }
      } catch (error) {
        console.error("Error:", error.message);
        setError("Failed to fetch restaurant details");
      }
    };
    fetchData();
  }, [user]);

  return (
    <>
      <NavBar2 />
      <div className="container-fluid rounded bg-white mt-5 mb-5">
        <div className="row">
          <div className="col-md-12 border-right">
            <div className="p-3 py-5">
              {error && <div className="alert alert-danger">{error}</div>}{" "}
              {/* Display error if it exists */}
              <div className="row mt-3">
                <div className="col-md-12">
                  <label className="labels">Name</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Name"
                    value={restaurantDetails.name}
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
                    value={restaurantDetails.mobileNumber}
                    readOnly
                  />
                </div>
                <div className="col-md-12 mt-3">
                  <label className="labels">Email Address</label>
                  <input
                    type="text"
                    className="form-control"
                    value={restaurantDetails.email}
                    readOnly
                  />
                </div>
              </div>
              <div className="mt-3">
                <label className="labels">Dietary Types Offered</label>
                <ul className="list-unstyled">
                  {restaurantDetails.dietaryTypes.map((type, index) => (
                    <li key={index}>{type}</li>
                  ))}
                </ul>
              </div>
              <div className="mt-3">
                <label className="labels">Address</label>
                <input
                  type="text"
                  className="form-control"
                  value={restaurantDetails.address}
                  readOnly
                />
              </div>
              <div className="mt-5 text-center">
                <Link to="/editRestProfile" className="btn btn-primary">
                  Edit Restaurant Details
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default RestaurantProfilePage;
