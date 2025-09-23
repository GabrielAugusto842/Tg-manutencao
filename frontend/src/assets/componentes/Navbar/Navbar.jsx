
import React from 'react';
import './Navbar.css';
import { FaSearch, FaUserCircle } from 'react-icons/fa';

const Navbar = () => {
  return (
    <header className="navbar">
      <div className="navbar-title">MANINETENCE MANAGER</div>

      <div className="navbar-search">
        <input type="text" placeholder="Pesquise por nome, e-mail ou função..." />
        <button><FaSearch /></button>
      </div>

      <div className="navbar-actions">
        <button className="logout-btn">Logout</button>
        <FaUserCircle className="profile-icon" />
      </div>
    </header>
  );
};

export default Navbar;