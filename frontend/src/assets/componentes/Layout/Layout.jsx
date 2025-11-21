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
          // Verifica se a string não é "null" ou "undefined"
          if (storedUser !== "undefined" && storedUser !== "null") {
            // Tenta analisar o JSON
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
  }, []); // O array vazio garante que isso rode apenas na montagem

  return (
    <div className="layout">
      {/* Sidebar fixa */}
      <aside className="layout-sidebar">
        {/* 3. Passe o objeto do usuário para o Sidebar */}
        <Sidebar user={user} />
      </aside>

      {/* Área principal */}
      <div className="layout-main">
        <header className="layout-navbar">
          <Navbar title={title} user={user} />{" "}
          {/* Opcional: passa user para o Navbar */}
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
