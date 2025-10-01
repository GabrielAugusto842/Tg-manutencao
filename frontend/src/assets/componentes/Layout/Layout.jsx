import React, { Children } from "react";
import Sidebar from "../Sidebar/Sidebar";
import Navbar from "../Navbar/Navbar";
import "./Layout.css";

const Layout = ({children}) => {
  return (
    <div className="layout">
      {/* Sidebar fixa */}
      <aside className="layout-sidebar">
        <Sidebar />
      </aside>

      {/* Área principal (só Navbar) */}
      <div className="layout-main">
        <header className="layout-navbar">
          <Navbar />
        </header>

    
        <div 
          className="layout-content">{children}
        </div>
        
      </div>
    </div>
  );
};

export default Layout;
