import React from "react";
import { Link, useNavigate } from "react-router-dom";
import logoImg from "../../images/fivers.png";

const NavBar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    const isConfirmed = window.confirm("Are you sure you want to log out?");

    if (isConfirmed) {
      // Perform any logout logic here (like clearing local storage, context updates, etc.)
      console.log("Logging out..."); // Placeholder for actual logout logic
      localStorage.clear();
      navigate("/");
    }
  };

  return (
    <nav className="navbar navbar-expand-lg bg-thlhgreen">
      <div className="container-fluid">
        <Link className="navbar-brand" to="/home">
          <img
            src={logoImg}
            alt="Fiver's Makan Logo"
            style={{ marginRight: "10px", height: "40px" }}
          />
          Fiver's Makan
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarSupportedContent"
          aria-controls="navbarSupportedContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarSupportedContent">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            {/* <li className="nav-item">
              <Link className="nav-link" to="/search">Search</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/favourites">Favourites Page</Link>
            </li> */}
            <li className="nav-item dropdown">
              <a
                className="nav-link dropdown-toggle"
                href="#"
                id="navbarDropdown"
                role="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                Bookings
              </a>
              <ul className="dropdown-menu" aria-labelledby="navbarDropdown">
                <li>
                  <Link className="dropdown-item" to="/bookings/active">
                    Active Reservations
                  </Link>
                </li>
                <li>
                  <Link className="dropdown-item" to="/bookings/completed">
                    Completed Reservations
                  </Link>
                </li>
              </ul>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/profile">
                Profile
              </Link>
            </li>
          </ul>
          <button className="btn btn-danger" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
