
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import './Navbar.css';
import { FaUserCircle, FaChevronDown, FaArrowRight } from 'react-icons/fa';
import { IoImageOutline, IoRefreshCircleOutline } from 'react-icons/io5'; 

const Navbar = () => {
  const navigate = useNavigate();
  const [openProfile, setOpenProfile] = useState(false);
  const profileRef = useRef();

  const user = {
    name: "Nick Jhony",
    email: "Nick@jhony.com.br",
  }
  

    const handleLogout = () => {
    navigate('/login');
  }

  const toggleProfileMenu = () => {
    setOpenProfile(!openProfile);
  }

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setOpenProfile(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="navbar">
      <div className="navbar-title">MANINETENCE MANAGER</div>

      <div className="navbar-actions-group">
       <button onClick={handleLogout} className="botao-sair">
          Logout
       </button>
     </div>

        <div className="profile-wrapper" ref={profileRef}>
          <div className="profile-icon-group" onClick={toggleProfileMenu}>
            <FaChevronDown className={`dropdown-arrow-icon ${openProfile ? 'open' : ''}`} />
             <FaUserCircle className="profile-icon" />
         </div>


          {openProfile && (
            <div className="profile-menu">
               {/* Seção de Informações do Usuário */}
               <div className="user-info">
                 <FaUserCircle className="user-avatar" />
               <div className="user-details">
                   <span className="user-name">{user.name}</span>
                 <span className="user-email">{user.email}</span>
               </div>
             </div>

              <button className="menu-option" onClick={() => alert("Trocar senha clicando")}>
                <IoRefreshCircleOutline className="option-icon" /> Trocar senha
              </button>
            </div>
            )}
        </div>
  </header>
  );
};

export default Navbar;