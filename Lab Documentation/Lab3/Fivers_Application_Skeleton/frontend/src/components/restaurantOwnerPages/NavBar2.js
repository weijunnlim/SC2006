import React from "react";
import { Link, useNavigate} from "react-router-dom";
import logoImg from '../../images/Fivers_makan_logo.png';

const NavBar2 = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    const isConfirmed = window.confirm("Are you sure you want to log out?");

    if (isConfirmed) {
      // Perform any logout logic here (like clearing local storage, context updates, etc.)
      console.log("Logging out..."); // Placeholder for actual logout logic
      localStorage.clear()
      navigate("/"); 
    }
  };

  return (  
    <nav className="navbar navbar-expand-lg bg-thlhgreen">
      <div className="container-fluid">
        <a className="navbar-brand" href="/restHome">
          <img src={logoImg} alt="Fiver's Makan Logo" style={{ marginRight: '10px', height: '30px' }} />
          Fiver's Makan</a>
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
            <li className="nav-item">
              <Link className="nav-link" to="/restHome">Bookings</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/restReviews">Reviews Page</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/restProfile">Profile</Link>
            </li>
          </ul>
          <button className="btn btn-danger" onClick={handleLogout}>Logout</button>
        </div>
      </div>
    </nav>
  );
}
 
export default NavBar2;
