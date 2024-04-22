import React, {useState} from "react";
import { Link } from "react-router-dom";
import NavBar from "./NavBar";

function FavouritesPage() {
  // Example list of favourite restaurants
  const [favourites, setFavourites] = useState([
    {
      id: 1,
      name: "Koufu Food Court",
      description: "Find us at northspine!",
      imageUrl: "path/to/image1.jpg", // Replace with indivudal rest Image
      detailPage: "/restaurants/koufu" // route to individual rest URL
    },
    {
      id: 2,
      name: "Pasta Express",
      description: "Find us at northspine!",
      imageUrl: "path/to/image2.jpg", // Replace with indivudal rest Image
      detailPage: "/restaurants/pasta-express" // route to individual rest URL
    },
    // Add more restaurants as needed
  ]);

  const removeFromFavourites = (id) => {
    const newFavourites = favourites.filter(restaurant => restaurant.id !== id);
    if (window.confirm("Are you sure you want to remove this restaurant from your favourites?")) {
      const newFavourites = favourites.filter(restaurant => restaurant.id !== id);
      setFavourites(newFavourites);
    }
    setFavourites(newFavourites);
  };

  return (
    <>
      <NavBar />
      <div className="container mt-5">
        <h1 className="mb-4">Favourite Restaurants</h1>
        {favourites.length > 0 ? (
          <div className="row">
            {favourites.map((restaurant) => (
              <div key={restaurant.id} className="col-md-4 mb-4">
                <div className="card">
                  <img src={restaurant.imageUrl} className="card-img-top" alt={restaurant.name} />
                  <div className="card-body">
                    <h5 className="card-title">{restaurant.name}</h5>
                    <p className="card-text">{restaurant.description}</p>
                    <Link to={restaurant.detailPage} className="btn btn-primary me-2">
                      View Details
                    </Link>
                    <button 
                      className="btn btn-danger" 
                      onClick={() => removeFromFavourites(restaurant.id)}>
                      Remove from Favourites
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="alert alert-info text-center" role="alert">
            No favourite restaurants found.
          </div>
        )}
      </div>
    </>
  );
}

export default FavouritesPage;
