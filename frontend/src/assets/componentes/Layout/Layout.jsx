import React, { useState, useEffect } from "react";
import Sidebar from "../Sidebar/Sidebar";
import Navbar from "../Navbar/Navbar";
import "./Layout.css";

const Layout = ({ children, title }) => {
  const [user, setUser] = useState(null);

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

        // Limpa o localStorage se o JSON for inválido
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
          <Navbar title={title} user={user} />{" "}
        </header>

        <div className="layout-content">
          {React.Children.map(children, (child) => {
            if (React.isValidElement(child)) {
              return React.cloneElement(child, { user });
            }
            return child;
          })}
        </div>
      </div>
    </div>
  );
};

export default Layout;
