import React from "react";
import './Navbar.css'


const Navbar = () => {
  return (
    <header className="header">
    <div className="nome">
        <h2 translate="no">MAINTENANCE MANAGER</h2>
    </div>

      <nav className="navbar">
      <a href="/logout"> </a>
      </nav>
    </header>
  )
}

export default Navbar;