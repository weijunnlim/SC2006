import React, { useEffect, useState, useRef } from "react";
import { Navigate } from "react-router-dom";
import NavBar from "./NavBar";
import useTokenVerification from "../tokenManage";
import FiversGif from "../../images/Fivers_gif.gif";
import { useUser } from "../../contexts/UserContext";
import ReservationModal from "../ReservationModal";
import logoImg from "../../images/mappin.png";
import blueDot from "../../images/blue-dot.png"

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
  const [autocompleteInput, setAutocompleteInput] = useState("");

  //Get Current latitude and Longitude
  //Using LocalStorage for Location storing instead
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);

  //Form Attributes for User Filtering
  const [searchTerm, setSearchTerm] = useState("");
  const [distanceValue, setDistance] = useState(1);
  const [minimumRating, setRating] = useState(0);
  const [dietaryRequirements, setDietaryRequirements] = useState([]);
  const [halal, setHalal] = useState(false)
  const [vegetarian, setVegetarian] = useState(false)

  const [userDisplayName, setUserDisplayName] = useState(() => {
    return localStorage.getItem("userDisplayName") || "";
  });

  function getLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          localStorage.setItem("currentLat", position.coords.latitude);
          localStorage.setItem("currentLng", position.coords.longitude);
          setLatitude(position.coords.latitude);
          setLongitude(position.coords.longitude);
        },
        (error) => {
          console.error("Error, getting location:", error.message);
          //Setting default value to NTU
          setLatitude(1.346276);
          setLongitude(103.6813);
          localStorage.setItem("currentLat", 1.346276);
          localStorage.setItem("currentLng", 103.6813);
        }
      );
    } else {
      console.error("Geolocation is not supproted by browser");
      //Setting default value to NTU
      setLatitude(1.346276);
      setLongitude(103.6813);
      localStorage.setItem("currentLat", 1.346276);
      localStorage.setItem("currentLng", 103.6813);
    }
  }

  //Set up Google Api method
  useEffect(() => {
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyABhCJZnZJWuvS-IEucRZJYqCb_4_O7cdg&libraries=places&callback=initMap`;
    script.defer = true;
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);


  const fetchRestaurants = async () => {
    console.log("Halal:", halal)
    console.log("Vegetarian:" , vegetarian)

    clearMarkers();
    
    const place = autocompleteRef.current.getPlace();
    setAutocompleteInput(place.name || "");

    const coords = {
      latitude: place.geometry.location.lat(),
      longitude: place.geometry.location.lng(),
    };
    createUserMarker(coords)
    setLatitude(coords.latitude);
    setLongitude(coords.longitude);
    localStorage.setItem("currentLat", place.geometry.location.lat());
    localStorage.setItem("currentLng", place.geometry.location.lng());

    mapRef.current.setCenter(place.geometry.location);
    console.log(coords.latitude, coords.longitude);
    const requestBody = {
      //location: { latitude: 1.346276, longitude: 103.6813 }, // Example static location (Singapore), replace with actual
      location: { latitude: coords.latitude, longitude: coords.longitude },
      distance: (1000 * distanceValue), // Example distance in meters
      minRating: minimumRating, // Example minimum rating
      dietaryRestrictions: {
        Halal : halal,
        Vegetarian: vegetarian
      }, // Example dietary restriction
      specifiedRestaurantName: "", // Example restaurant name
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
      const data = await response.json(); // Convert the response data to JSON
      console.log(data);
      setRestaurants(data.restaurants); // Assuming the API returns an array of restaurants
      data.restaurants.forEach(createRMarker);
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
      const data = await response.json(); // Convert the response data to JSON
      console.log(data);
      setOurRestaurants(data.restaurants); // Assuming the API returns an array of restaurants
      data.restaurants.forEach(createBMarker);
    } catch (error) {
      console.error("Error fetching restaurants:", error);
      setError(error.message);
    }
  };

  //Initialise Map onto Browser
  useEffect(() => {
    window.initMap = initMap;
  }, []);

  //Clear Markets everytime Map is called for clean state
  const clearMarkers = () => {
    markers.current.forEach((marker) => marker.setMap(null));
    markers.current = [];
  };

  //Current Location of search with Google Api Search, Need to add marker for current user location for UI feasiblity
  const initMap = () => {
    var currentLat = parseFloat(localStorage.getItem("currentLat"));
    var currentLng = parseFloat(localStorage.getItem("currentLng"));
    console.log(currentLat);
    console.log(currentLng);
    const options = {
      center: { lat: currentLat, lng: currentLng }, //change
      zoom: 15,
      styles: [
        {
          featureType: "poi",
          stylers: [{ visibility: "off" }],
        },
      ],
    };

    mapRef.current = new window.google.maps.Map(mapRef.current, options);

    autocompleteRef.current = new window.google.maps.places.Autocomplete(
      autocompleteRef.current,
      {
        types: ["geocode"],
        componentRestrictions: { country: "SG" },
      }
    );

    // autocompleteRef.current.addListener("place_changed", fetchRestaurants);
  };


  const createUserMarker = (location) =>{

    const lat = location.latitude;
    const lng = location.longitude;

    const marker = new window.google.maps.Marker({
      map: mapRef.current,
      position: {
        lat: lat,
        lng: lng
      },
      icon: {
        url: blueDot,
        scaledSize: new window.google.maps.Size(45, 45), // Adjust size as needed
      },
    })
    markers.current.push(marker)
  }

  const createRMarker = (restaurant) => {
    const availabilityText = restaurant.IsAvailable !== undefined ? (restaurant.IsAvailable ? "Yes" : "No") : "Information unavailable";
    const marker = new window.google.maps.Marker({
      map: mapRef.current,
      position: restaurant.Location,
      title: restaurant.Name,
      icon: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
    });

    markers.current.push(marker);

    const infowindow = new window.google.maps.InfoWindow({
      content: `
        <strong>${restaurant.Name}</strong><br>
        Rating: ${restaurant.Rating || "Not available"}<br>
        Address: ${restaurant.Address || "Not available"}<br>
        Available for Booking: ${availabilityText}<br>
        <br>
      `,
    });

    marker.addListener("click", () => {
      infowindow.open(mapRef.current, marker);
    });
  };

  const createBMarker = (restaurant) => {
    const availabilityText = restaurant.IsAvailable !== undefined ? (restaurant.IsAvailable ? "Yes" : "No") : "Information unavailable";
    const lat = restaurant.Location._latitude;
    const lng = restaurant.Location._longitude;
    const position = new window.google.maps.LatLng(lat, lng);

    const marker = new window.google.maps.Marker({
      map: mapRef.current,
      position: position,
      title: restaurant.Name,
      icon: {
        url: logoImg,
        scaledSize: new window.google.maps.Size(60, 60), 
      },
    });

    markers.current.push(marker);

    const infowindow = new window.google.maps.InfoWindow({
      content: `
        <strong>${restaurant.Name}</strong><br>
        Rating: ${restaurant.Rating || "Not available"}<br>
        Address: ${restaurant.Address || "Not available"}<br>
        Available for Booking: ${availabilityText}<br>
        <br>
      `,
    });

    marker.addListener("click", () => {
      infowindow.open(mapRef.current, marker);
    });
  };

  //For primary functions of Getting Restaurants paired with Fivers or Not, need to add refreshTokenFunction as well
  useEffect(() => {
    getLocation();
    if (isLoading) {
      return;
    }

    if (!isValidToken) {
      return <Navigate to="/" />;
    }

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
          var displayName = json.email;
          if (json.name !== "") displayName = json.name;
          setUserDisplayName(displayName);
          // Store user display name in local storage
          localStorage.setItem("userDisplayName", displayName);
        }
      } catch (error) {
        console.log("Error", error.message);
      }
    };

    fetchData();
  }, [isLoading, isValidToken, user]);

  const handleReservationClick = (restaurant) => {
    // Here, you can set state to show a modal or navigate to a different component
    // For demonstration, let's assume you're setting state to open a modal
    console.log(`Booking for ${restaurant.restaurant_id}`);
    localStorage.setItem("restaurant_id", restaurant.restaurant_id);
    // Set the selected restaurant for reservation
    setSelectedRestaurant(restaurant);
    setShowReservationModal(true);
  };

  const handleDistance = (value) => {
    setDistance(value);
  };

  const handleRating = (value) => {
    setRating(value);
  };

  const handleDietaryRequirement = (value) => {
    setDietaryRequirements(prev => {
      // Check if the value already exists in the array
      const index = prev.indexOf(value);
      if (index === -1) {
        // Not in the array, add it
        return [...prev, value];
      } else {
        // Already in the array, remove it
        return prev.filter(item => item !== value);
      }
    });
    console.log(dietaryRequirements)
  };

  const handleHalal = () => {
    setHalal(prev => !prev)
    // console.log(halal)
  }

  const handleVegetarian = () => {
    setVegetarian(prev => !prev)
    // console.log(vegetarian)
  }
  //function to display stars
  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5 ? 1 : 0;
    const emptyStars = 5 - fullStars - halfStar;
    return (
      <>
        {[...Array(fullStars)].map((_, i) => (
          <i className="bi bi-star-fill text-warning" key={`full-${i}`}></i>
        ))}
        {halfStar === 1 && (
          <i className="bi bi-star-half text-warning" key="half"></i>
        )}
        {[...Array(emptyStars)].map((_, i) => (
          <i className="bi bi-star text-warning" key={`empty-${i}`}></i>
        ))}
      </>
    );
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
        <div className="row justify-content-center">
          <div className="col-10 mb-4" style={{ width: "100%" }}>
            <input
              ref={autocompleteRef}
              id="autocomplete"
              type="text"
              className="form-control"
              placeholder="Search for restaurants near..."
              style={{ width: "100%" }}
            />
            <button className="btn btn-primary mt-2" onClick={fetchRestaurants}>Search</button>
          </div>
          <div className="col-10" style={{ width: "100%" }}>
            <div className="row">
              <div className="col">
                <div className="dropdown mr-2">
                  <button
                    className="btn btn-thgreen dropdown-toggle"
                    type="button"
                    id="distanceDropdown"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                    style={{ width: "100%" }}
                  >
                    Distance: {"Within " + distanceValue + "km"}
                  </button>
                  <ul
                    className="dropdown-menu"
                    aria-labelledby="distanceDropdown"
                    style={{ width: "100%" }}
                  >
                    <li>
                      <button
                        className="dropdown-item"
                        onClick={() => handleDistance(1)}
                      >
                        Within 1km
                      </button>
                    </li>

                    <li>
                      <button
                        className="dropdown-item"
                        onClick={() => handleDistance(2)}
                      >
                        Within 2km
                      </button>
                    </li>
                    <li>
                      <button
                        className="dropdown-item"
                        onClick={() => handleDistance(3)}
                      >
                        Within 3km
                      </button>
                    </li>
                    <li>
                      <button
                        className="dropdown-item"
                        onClick={() => handleDistance(4)}
                      >
                        Within 4km
                      </button>
                    </li>
                    <li>
                      <button
                        className="dropdown-item"
                        onClick={() => handleDistance(5)}
                      >
                        Within 5km
                      </button>
                    </li>
                  </ul>
                </div>
              </div>


              <div className="col">
                <div className="dropdown">
                  <button
                    className="btn btn-thgreen dropdown-toggle"
                    type="button"
                    id="dietDropdown"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                    style={{ width: "100%" }}
                  >
                    Dietary Requirements:   
                  </button>
                  <ul className="dropdown-menu" aria-labelledby="dietDropdown" style={{ width: "100%" }}>
                    <li style={{ padding: '10px' }}>
                      <div className = "form-check">
                      <input
                      className="form-check-input"
                      type="checkbox"
                      id="halalCheckbox"
                      checked={halal}
                      onChange={handleHalal}
                      style={{ height: '20px', width: '20px', marginRight: '10px' }}
                    />
                      <label className="form-check-label" htmlFor="halalCheckbox"></label>
                        Halal
                      </div>
                    </li>
                    <li style={{ padding: '10px' }}>
                    <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="vegetarianCheckbox"
                      checked={vegetarian}
                      onChange={handleVegetarian}
                      style={{ height: '20px', width: '20px', marginRight: '10px' }}
                    />
                    <label className="form-check-label" for="vegetarianCheckbox">
                        Vegetarian
                        </label>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="col">
                <div className="dropdown">
                  <button
                    className="btn btn-thgreen dropdown-toggle"
                    type="button"
                    id="dietDropdown"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                    style={{ width: "100%" }}
                  >
                    Minimum Rating {minimumRating} Stars
                  </button>
                  <ul className="dropdown-menu" aria-labelledby="dietDropdown" style={{ width: "100%" }}>

                  <li>
                      <button
                        className="dropdown-item"
                        onClick={() => handleRating(0)}
                      >
                        No minimum
                      </button>
                    </li>

                  <li>
                      <button
                        className="dropdown-item"
                        onClick={() => handleRating(1)}
                      >
                        1 Star
                      </button>
                    </li>

                    <li>
                      <button
                        className="dropdown-item"
                        onClick={() => handleRating(2)}
                      >
                        2 Stars
                      </button>
                    </li>

                    <li>
                      <button
                        className="dropdown-item"
                        onClick={() => handleRating(3)}
                      >
                        3 Stars
                      </button>
                    </li>

                    <li>
                      <button
                        className="dropdown-item"
                        onClick={() => handleRating(4)}
                      >
                        4 Stars
                      </button>
                    </li>

                    <li>
                      <button
                        className="dropdown-item"
                        onClick={() => handleRating(5)}
                      >
                        5 Stars
                      </button>
                    </li>

                  </ul>
                </div>
              </div>
              


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
                {ourRestaurants.filter(ourRestaurants => ourRestaurants.IsAvailable !== false).map((fiverRestaurant, index) => (
                  <li key={index} className="list-group-item">
                    <strong>{fiverRestaurant.Name}</strong>
                    {fiverRestaurant.Rating && (
                      <span className="ms-2">
                        {renderStars(fiverRestaurant.Rating)}
                      </span>
                    )}{" "}
                    <br></br>
                    {fiverRestaurant.Waiting_time !== undefined && (
                      <p>Estimated Wait: <strong>{fiverRestaurant.Waiting_time} mins</strong></p>
                    )}
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
              <p>Unfortunately, there are no Fivers' Restaurants specific to your needs.</p>
            )}
          </div>
        </div>
        <div className="row mt-4">
          <div className="col-15">
            <h3> Other Restaurants</h3>
            {restaurants && restaurants.length > 0 ? (
              <ul className="list-group">
                {restaurants.map((restaurant, index) => (
                  <li key={index} className="list-group-item">
                    <strong>{restaurant.Name}</strong>
                    {restaurant.Rating && (
                      <span className="ms-2">
                        {renderStars(restaurant.Rating)}
                      </span>
                    )}
                    <br></br>
                    {restaurant.Address}
                    <button
                      className="btn btn-primary float-end"
                      // onClick={() => handleReservationClick(restaurant)}
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
              <p>Unfortunately, there are no restaurants specific to your needs.</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default HomePage;
