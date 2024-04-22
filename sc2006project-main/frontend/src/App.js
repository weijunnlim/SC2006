import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import "./bootstrap.css";
import "../node_modules/bootstrap/dist/js/bootstrap.bundle";
import { UserProvider } from './contexts/UserContext';
import LoginPage from "./components/pages/LoginPage";
import HomePage from "./components/pages/HomePage";
import ForgotPasswordPage from "./components/pages/ForgotPasswordPage";
import SignupPage from "./components/pages/SignupPage";
// import SearchPage from "./components/pages/SearchPage";
// import FavouritesPage from "./components/pages/FavouritesPage";
import ActiveBookingsPage from "./components/pages/ActiveBookingsPage";
import CompletedBookingsPage from "./components/pages/CompletedBookingsPage";
import ProfilePage from "./components/pages/ProfilePage";
import EditProfilePage from "./components/pages/EditProfilePage";
import EditReservationPage from "./components/pages/EditReservationPage";
import FeedbackPage from "./components/pages/FeedbackPage";
import ChangePassword from "./components/pages/ChangePassword";
import RestaurantBookingsPage from "./components/restaurantOwnerPages/RestaurantBookingsPage";
import RestaurantReviewsPage from "./components/restaurantOwnerPages/RestaurantReviewsPage";
import RestaurantProfilePage from "./components/restaurantOwnerPages/RestaurantProfilePage";
import EditRestaurantProfilePage from "./components/restaurantOwnerPages/EditRestaurantProfilePage";
import AddressPage from "./components/restaurantOwnerPages/AddressPage";

function App() {
  return (
    <UserProvider>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        {/* Patron side routes */}
        <Route path="/home" element={<HomePage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/signup" element={<SignupPage />} />
        {/* <Route path="/search" element={<SearchPage />} />
        <Route path="/favourites" element={<FavouritesPage />} /> */}
        <Route path="/bookings/active" element={<ActiveBookingsPage />} />
        <Route path="/bookings/completed" element={<CompletedBookingsPage />} />
        <Route path="/bookings/edit" element={<EditReservationPage />} />
        <Route path="/bookings/feedback" element={<FeedbackPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/edit-profile" element={<EditProfilePage />} />
        <Route path="/changepassword" element={<ChangePassword />} />
        {/* Restaurant Owner side routes */}
        <Route path="/restHome" element={<RestaurantBookingsPage />} />
        <Route path="/restReviews" element={<RestaurantReviewsPage />} />
        <Route path="/restProfile" element={<RestaurantProfilePage />} />
        <Route path="/editRestProfile" element={<EditRestaurantProfilePage />} />
        <Route path="/addressPage" element={<AddressPage />} />
      </Routes>
    </UserProvider>
  );
}

export default App;
