import React, { useState, useEffect } from "react";
import Sidebar from "../Sidebar/Sidebar";
import Navbar from "../Navbar/Navbar";
import "./Layout.css";

const Layout = ({ children, title }) => {
  // 1. Defina o estado para armazenar o objeto do usuário
  const [user, setUser] = useState(null);

  // 2. Use useEffect para carregar o usuário do localStorage uma vez
  useEffect(() => {
    const loadUserFromStorage = () => {
      try {
        const storedUser = localStorage.getItem("user");

        if (storedUser) {
          if (storedUser !== "undefined" && storedUser !== "null") {
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);
          }
        }
      } catch (error) {
        console.error("Erro ao carregar usuário no Layout:", error);

        localStorage.removeItem("user");
      }
    };

    loadUserFromStorage();
  }, []);

  return (
    <div className="layout">
      {/* Sidebar fixa */}
      <aside className="layout-sidebar">
        <Sidebar user={user} />
      </aside>

      {/* Área principal */}
      <div className="layout-main">
        <header className="layout-navbar">
          <Navbar title={title} />
        </header>

        <div className="layout-content">{children}</div>
      </div>
    </div>
  );
};

export default Layout;
