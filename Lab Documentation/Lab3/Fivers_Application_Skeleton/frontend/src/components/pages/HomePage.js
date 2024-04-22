import React, { useEffect, useState, useRef } from "react";
import { Navigate } from "react-router-dom";
import NavBar from "./NavBar";
import useTokenVerification from "../tokenManage";
import FiversGif from "../../images/Fivers_gif.gif";
import { useUser } from "../../contexts/UserContext";
import ReservationModal from "../ReservationModal";

function HomePage() {
  const { user } = useUser();
  const mapRef = useRef(null);
  const autocompleteRef = useRef(null);
  const markers = useRef([]);
  const [error, setError] = useState(null);
  const { isLoading, isValidToken } = useTokenVerification();
  const [restaurants, setRestaurants] = useState([]);
  const [ourRestaurants, setOurRestaurants] = useState([]);
  const [showReservationModal, setShowReservationModal] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);

  // Get Current latitude and Longitude
  // Using LocalStorage for Location storing instead
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);

  // Form Attributes for User Filtering
  const [searchTerm, setSearchTerm] = useState("");
  const [distanceValue, setDistance] = useState("0-2km");
  const [minimumRating, setRating] = useState();
  const [dietaryRequirements, setDietaryRequirements] = useState([""]);
  const [location, setLocation] = useState({
  latitude: parseFloat(localStorage.getItem("currentLat")),
  longitude: parseFloat(localStorage.getItem("currentLng")),
});

  const [userDisplayName, setUserDisplayName] = useState(() => {
    // Retrieve user display name from local storage on component mount
    return localStorage.getItem("userDisplayName") || "";
  });

  // Set up Google Api method
  useEffect(() => {
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyABhCJZnZJWuvS-IEucRZJYqCb_4_O7cdg&libraries=places&callback=initMap`;
    script.defer = true;
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  // Initialise Map onto Browser
  useEffect(() => {
    window.initMap = initMap;
  }, []);

  // Clear Markets everytime Map is called for clean state
  const clearMarkers = () => {
    markers.current.forEach((marker) => marker.setMap(null));
    markers.current = [];
  };

  // Current Location of search with Google Api Search, Need to add marker for current user location for UI feasiblity
  const initMap = () => {
    const options = {
      center: { lat: 1.3470419, lng: 103.6806 },
      zoom: 15,
      styles: [{ featureType: "poi", stylers: [{ visibility: "off" }] }],
    };

    mapRef.current = new window.google.maps.Map(mapRef.current, options);

    autocompleteRef.current = new window.google.maps.places.Autocomplete(
      autocompleteRef.current,
      {
        types: ["geocode"],
        componentRestrictions: { country: "SG" },
      }
    );

    autocompleteRef.current.addListener("place_changed", searchNearbyPlaces);
  };

  // Based on Search Bar auto complete, will set the markers etc
  const searchNearbyPlaces = () => {
    clearMarkers();
    // Get selected place from autocomplete
    const place = autocompleteRef.current.getPlace();

    const coords = {
      latitude: place.geometry.location.lat(),
      longitude: place.geometry.location.lng(),
    };
    localStorage.setItem("currentLat", place.geometry.location.lat());
    localStorage.setItem("currentLng", place.geometry.location.lng());

    if (!place.geometry || !place.geometry) {
      alert("No details available for input: '" + place.name + "'");
      return;
    }

    mapRef.current.setCenter(place.geometry.location);
    const service = new window.google.maps.places.PlacesService(mapRef.current);
    service.nearbySearch(
      {
        location: place.geometry.location,
        radius: "5000",
        type: ["restaurant"],
      },
      callback
    );
  };

  const callback = (results, status) => {
    if (status === window.google.maps.places.PlacesServiceStatus.OK) {
      results.forEach(createMarker);
    }
  };

  const createMarker = (place) => {
    const marker = new window.google.maps.Marker({
      map: mapRef.current,
      position: place.geometry.location,
      title: place.name,
      icon: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
    });

    markers.current.push(marker);

    const infowindow = new window.google.maps.InfoWindow({
      content: `
        <strong>${place.name}</strong><br>
        Rating: ${place.rating || "Not available"}<br>
        Address: ${place.vicinity || "Not available"}<br>
        Price Level: ${
          place.price_level !== undefined
            ? "$".repeat(place.price_level + 1)
            : "Not available"
        }<br>
      `,
    });

    marker.addListener("click", () => {
      infowindow.open(mapRef.current, marker);
    });
  };

  // For primary functions of Getting Restaurants paired with Fivers or Not, need to add refreshTokenFunction as well
  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (!isValidToken) {
      return <Navigate to="/" />;
    }

    const fetchData = async () => {
      try {
        const response = await fetch(
          `http://localhost:4000/api/authentication/${user}`,
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
          const displayName = json.user.email;
          setUserDisplayName(displayName);
          // Store user display name in local storage
          // localStorage.setItem("userDisplayName", displayName);
        } 
      } catch (error) {
        console.log("Error", error.message);
      }

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
          const displayName = json.name;
          if (displayName !== '') setUserDisplayName(displayName);
          // Store user display name in local storage
          localStorage.setItem("userDisplayName", displayName);
        } 
      } catch (error) {
        console.log("Error", error.message);
      }


    };

    const getLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const newLocation = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            };
            setLocation(newLocation); // This will trigger useEffect
            // Store in localStorage if necessary for other uses
            localStorage.setItem("currentLat", newLocation.latitude);
            localStorage.setItem("currentLng", newLocation.longitude);
          },
          (error) => {
            console.error("Error, getting location:", error.message);
            const defaultLocation = { latitude: 1.346276, longitude: 103.6813 };
            setLocation(defaultLocation);
            localStorage.setItem("currentLat", defaultLocation.latitude);
            localStorage.setItem("currentLng", defaultLocation.longitude);
          }
        );
      } else {
        console.error("Geolocation is not supported by this browser");
      }
    };
    getLocation();
    fetchData();
  }, [isLoading, isValidToken, user]);

  // Fetch Restaurant and store into Array List to show alter
  useEffect(() => {
    const fetchRestaurants = async () => {
      console.log(latitude, longitude);
      const requestBody = {
        location: {
          latitude: localStorage.getItem("currentLat"),
          longitude: localStorage.getItem("currentLng"),
        },
        distance: 5000,
        minRating: 3,
        dietaryRestriction: "",
        specifiedRestaurantName: "",
      };

      try {
        const response = await fetch(`http://localhost:4000/api/search`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        console.log(data);
        setRestaurants(data.restaurants);
      } catch (error) {
        console.error("Error fetching restaurants:", error);
        setError(error.message);
      }

      try {
        const response = await fetch(
          `http://localhost:4000/api/search/restaurants`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(requestBody),
          }
        );

        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        console.log(data);
        setOurRestaurants(data.restaurants);
      } catch (error) {
        console.error("Error fetching restaurants:", error);
        setError(error.message);
      }
    };

    if (isValidToken && !isLoading) {
      fetchRestaurants();
    }
  }, [
    isValidToken,
    isLoading,
    localStorage.getItem("currentLat"),
    localStorage.getItem("currentLng"),
  ]);

  const handleReservationClick = (restaurant) => {
    console.log(`Booking for ${restaurant.restaurant_id}`);
    localStorage.setItem("restaurant_id", restaurant.restaurant_id);
    setSelectedRestaurant(restaurant);
    setShowReservationModal(true);
  };

  const handleDistance = (value) => {
    setDistance(value);
  };

  const handleDietaryRequirement = (value) => {
    setDietaryRequirements(value);
  };

  return (
    <>
      <NavBar />
      <div className="container my-4">
        <div className="text-center mb-4">
          {user && <h2>Ready to Makan, {userDisplayName}? </h2>}
        </div>
        <div className="row justify-content-center mb-4">
          <div className="col-12 col-md-8 text-center">
            <img src={FiversGif} alt="Fiver's Makan" className="img-fluid" />
          </div>
        </div>
        <div className="row" id="accordion">
          <div className="col-12">
            <input
              ref={autocompleteRef}
              id="autocomplete"
              type="text"
              className="form-control mb-4"
              placeholder="Search for restaurants near..."
              style={{ width: "100%" }} // Adjusted width to 100%
            />
          </div>
          <div className="col-md-2">
            <div className="dropdown">
              <button
                className="btn btn-thgreen dropdown-toggle"
                type="button"
                id="distanceDropdown"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                Distance: {distanceValue}
              </button>
              <ul className="dropdown-menu" aria-labelledby="distanceDropdown">
                <li>
                  <button
                    className="dropdown-item"
                    onClick={() => handleDistance("0-2km")}
                  >
                    0-2km
                  </button>
                </li>
                <li>
                  <button
                    className="dropdown-item"
                    onClick={() => handleDistance("2-4km")}
                  >
                    2-4km
                  </button>
                </li>
                <li>
                  <button
                    className="dropdown-item"
                    onClick={() => handleDistance("4-6km")}
                  >
                    4-6km
                  </button>
                </li>
                <li>
                  <button
                    className="dropdown-item"
                    onClick={() => handleDistance("6-8km")}
                  >
                    6-8km
                  </button>
                </li>
              </ul>
            </div>
          </div>
          <div className="col-md-1">
            <div className="dropdown">
              <button
                className="btn btn-thgreen dropdown-toggle"
                type="button"
                id="dietDropdown"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                Dietary Requirement: {dietaryRequirements}
              </button>
              <ul className="dropdown-menu" aria-labelledby="dietDropdown">
                <li>
                  <button
                    className="dropdown-item"
                    onClick={() => handleDietaryRequirement("None")}
                  >
                    None
                  </button>
                </li>
                <li>
                  <button
                    className="dropdown-item"
                    onClick={() => handleDietaryRequirement("Halal")}
                  >
                    Halal
                  </button>
                </li>
                <li>
                  <button
                    className="dropdown-item"
                    onClick={() => handleDietaryRequirement("Vegetarian")}
                  >
                    Vegetarian
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="row justify-content-center">
          <div className="col-12">
            <div ref={mapRef} style={{ height: "500px", width: "100%" }}></div>
          </div>
        </div>

        {/* Display Restaurants Here */}
        <div className="row mt-4">
          <div className="col-12">
            <h3> Fivers Restaurants</h3>
            {ourRestaurants && ourRestaurants.length > 0 ? (
              <ul className="list-group">
                {ourRestaurants.map((fiverRestaurant, index) => (
                  <li key={index} className="list-group-item">
                    {fiverRestaurant.Name} <br></br>
                    {fiverRestaurant.Address}
                    <button
                      className="btn btn-primary float-end"
                      onClick={() => handleReservationClick(fiverRestaurant)}
                    >
                      Book
                    </button>
                    {showReservationModal && (
                      <ReservationModal
                        restaurant={selectedRestaurant}
                        onClose={() => setShowReservationModal(false)}
                      />
                    )}
                    {/* can display more fields here but dummy restaurants for now */}
                  </li>
                ))}
              </ul>
            ) : (
              <p>No restaurants available or data is not in expected format.</p>
            )}
          </div>
        </div>

        <div className="row mt-4">
          <div className="col-12">
            <h3> Other Restaurants</h3>
            {restaurants && restaurants.length > 0 ? (
              <ul className="list-group">
                {restaurants.map((restaurant, index) => (
                  <li key={index} className="list-group-item">
                    {restaurant.Name} <br></br>
                    {restaurant.Address}
                    <button
                      className="btn btn-primary float-end"
                      onClick={() => handleReservationClick(restaurant)}
                    >
                      Find your way there
                    </button>
                    {showReservationModal && (
                      <ReservationModal
                        restaurant={selectedRestaurant}
                        onClose={() => setShowReservationModal(false)}
                      />
                    )}
                    {/* can display more fields here but dummy restaurants for now */}
                  </li>
                ))}
              </ul>
            ) : (
              <p>No restaurants available or data is not in expected format.</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default HomePage;
