import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LoginPage from './components/pages/LoginPage';
import HomePage from './components/pages/HomePage';
import ForgotPasswordPage from './components/pages/ForgotPasswordPage';
import SignupPage from './components/pages/SignupPage';
import SearchPage from './components/pages/SearchPage';
import FavouritesPage from './components/pages/FavouritesPage';
import BookingsPage from './components/pages/BookingsPage';
import ProfilePage from './components/pages/ProfilePage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/home" element={<HomePage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/search" element={<SearchPage />} />
      <Route path="/favourites" element={<FavouritesPage />} />
      <Route path="/bookings" element={<BookingsPage />} />
      <Route path="/profile" element={<ProfilePage />} />
    </Routes>
  );
}

export default App;