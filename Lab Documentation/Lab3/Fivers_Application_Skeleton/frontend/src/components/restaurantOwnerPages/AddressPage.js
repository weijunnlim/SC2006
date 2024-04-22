import React, { useEffect, useRef } from "react";
import NavBar2 from "./NavBar2";

const AddressPage = () => {
  const mapRef = useRef(null);
  const autocompleteRef = useRef(null);
  const markers = useRef([]);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyABhCJZnZJWuvS-IEucRZJYqCb_4_O7cdg&libraries=places&callback=initMap`;
    script.defer = true;
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  useEffect(() => {
    window.initMap = initMap;
  }, []);

  const clearMarkers = () => {
    markers.current.forEach((marker) => marker.setMap(null));
    markers.current = [];
  };

  const initMap = () => {
    const options = {
      center: { lat: 1.3483, lng: 103.6831 },
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

    autocompleteRef.current.addListener("place_changed", searchNearbyPlaces);
  };

  const searchNearbyPlaces = () => {
    clearMarkers();
    // Get selected place from autocomplete
    const place = autocompleteRef.current.getPlace();

    if (!place.geometry || !place.geometry.location) {
      alert("No details available for input: '" + place.name + "'");
      return;
    }

    mapRef.current.setCenter(place.geometry.location);

    const service = new window.google.maps.places.PlacesService(mapRef.current);
    service.nearbySearch(
      {
        location: place.geometry.location,
        radius: "500",
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

  return (
    <>
      <NavBar2 />
      <div className="container mt-5">
        <div className="row">
          <div className="col">
            <input
              ref={autocompleteRef}
              id="autocomplete"
              type="text"
              className="form-control mb-4"
              placeholder="Enter new address"
              style={{ width: "100%" }}
            />
            <div ref={mapRef} style={{ height: "500px", width: "100%" }}></div>
          </div>
        </div>
        <div className="row mt-3">
          <div className="col-6">
            <a href="/restProfile" className="btn btn-primary">
              Save Address
            </a>
          </div>
          <div className="col-6 d-flex justify-content-end">
            <a href="/editRestProfile" className="btn btn-secondary">
              Cancel
            </a>
          </div>
        </div>
      </div>
    </>
  );
};

export default AddressPage;
