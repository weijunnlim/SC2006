import React, { useState,useEffect } from "react";
import { Link } from "react-router-dom";
import NavBar from "./NavBar"
import { GoogleMap, useLoadScript, Marker, InfoWindow } from "@react-google-maps/api";

const libraries = ["places"];
const mapContainerStyle = {
  //width: "82vw",
  //height: "calc(100vh - 56px)", // Adjusted height to accommodate the navbar
  width: "100%",
  height: "calc(100vh - 56px)",
};

const center = {
  lat: 1.346276735010386, // default latitude
  lng: 103.68138362454889, // default longitude
};

const SearchPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [mapCenter, setMapCenter] = useState(center);
  const [markers, setMarkers] = useState([]); // Define markers state
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: "AIzaSyABhCJZnZJWuvS-IEucRZJYqCb_4_O7cdg",
    libraries,
  });
/*
  const handleSearch = (e) => {
    e.preventDefault();
    // Perform search action with searchQuery
    // You can use the Places Autocomplete service to convert the search query to coordinates
    // For example, you can use the Geocoding API to get the coordinates of the searched location
    // Once you have the coordinates, you can update the mapCenter state and re-center the map
    console.log("Search query:", searchQuery);
    // Here, you can make API calls to fetch coordinates based on searchQuery and update mapCenter accordingly
  };
*/

const [selectedMarker, setSelectedMarker] = useState(null); // Define selected marker state
useEffect(() => {
  const fetchRestaurants = async () => {
    const requestBody = {
      location: {
        latitude: 1.346276735010386,
        longitude: 103.68138362454889
      },
      // Add other request parameters as needed
      //specifiedRestaurantName: "Blue Ocean Kopi & Toast"

      //minRating: 4
      //dietaryRestriction: "halal"
    };

    try {
      const response = await fetch("http://localhost:4000/api/search/restaurants", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      const restaurantMarkers = data.restaurants.map(restaurant => ({
        position: {
          lat: restaurant.Location._latitude,
          lng: restaurant.Location._longitude
        },
        name: restaurant.Name,
        rating: restaurant.Rating,
        address: restaurant.Address,
        dietaryRestriction: restaurant.dietaryRestrictions,
        distance: restaurant.distance
      }));
      setMarkers(restaurantMarkers);
    } catch (error) {
      console.error("Error fetching restaurants:", error);
    }
  };

  fetchRestaurants();
}, []);

  if (loadError) {
    return <div>Error loading maps</div>;
  }

  if (!isLoaded) {
    return <div>Loading maps</div>;
  }

  return (
    <>
    <NavBar />
    <div class="container-fluid">
      <div class="row">
        <div class="col-md-3">
          <div class="row align-items-center">
            <div class="col-auto">
              <h1 class="display-6">Results </h1>
            </div>
            <div class="col-auto">
              <p class="h6 display-6">
                <i class="bi bi-info-circle"></i>
              </p>
            </div>
            <div class="card mb-3">
              <div class="row g-0">
                <div class="col-md-4">
                  <img src="..." class="img-fluid rounded-start" alt="Image"/>
                </div>
              <div class="col-md-8">
                <div class="card-body">
                  <h5 class="card-title">Restaurant</h5>
                  <p class="card-text">This is a wider card with supporting text below as a natural lead-in to additional content. This content is a little bit longer.</p>
                  <button class="btn btn-primary">View Details</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
        <div class="col-md-9">
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          zoom={17}
          center={mapCenter}
          options={{
            styles: [
              {
                featureType: "poi",
                stylers: [{ visibility: "off" }],
              },
            ],
          }}
        >
          onClick={() => {
            setSelectedMarker(null); // Close InfoWindow if map is clicked
          }}
        
          {/* Render markers for restaurants */}
          {markers.map((marker, index) => (
          
            <Marker
              key={index}
              position={marker.position}
              label={marker.name}
              title={marker.name} // Set the title for each marker
              onClick={() => {
                setSelectedMarker(marker); // Set selected marker when clicked
              }}
            >
              {/* Render InfoWindow for each restaurant marker */}
              {selectedMarker === marker && (
                <InfoWindow
                  position={selectedMarker.position}
                  onCloseClick={() => {
                    setSelectedMarker(null); // Close InfoWindow when close button is clicked
                  }}
                >
                  <div>
                    <h6>{selectedMarker.name}</h6>
                    <p>Rating: {selectedMarker.rating}</p>
                    <p>Address: {selectedMarker.address}</p>
                    <p>Dietary Restriction: {selectedMarker.dietaryRestriction}</p>
                    <p>Distance: {selectedMarker.distance}</p>
                    <button className="btn btn-primary">View Details</button>
                  </div>
                </InfoWindow>
              )}
            </Marker>
          ))}
          {/* Marker for current location */}
          <Marker
            position={mapCenter}
            label= {"Current Location"}
            icon={{
              url: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png",
              scaledSize: new window.google.maps.Size(30, 30)
            }}
            onClick={() => {
              setSelectedMarker({ position: mapCenter, title: "Current Location", label:"Current Location"   });
            }}
          >
            {/* Render InfoWindow for the current location marker */}
            {selectedMarker?.title === "Current Location" && (
              <InfoWindow
                position={selectedMarker.position}
                onCloseClick={() => {
                  setSelectedMarker(null); // Close InfoWindow when close button is clicked
                }}
              >
                <div>
                  <h6>{selectedMarker.title}</h6>
                </div>
              </InfoWindow>
            )}
          </Marker>
        </GoogleMap>
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Restaurant Details</h5>
              <ul className="list-group">
              {markers.map((marker, index) => (
  <li key={index} className="list-group-item">
    <h6>{marker.name}</h6>
    <p>Rating: {marker.rating}</p>
    <p>Address: {marker.address}</p>
    <p>Dietary Restriction: {marker.dietaryRestriction}</p>
    <p>Distance: {marker.distance}</p>
    <button className="btn btn-primary">View Details</button>
  </li>
))}

              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  </>
  );
}


export default SearchPage;