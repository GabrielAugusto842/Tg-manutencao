import React, { useState } from "react";
import Sidebar from "../../componentes/Sidebar/Sidebar.jsx";
import Navbar from "../../componentes/Navbar/Navbar.jsx"
import "../../componentes/Navbar/Navbar.css"; 
import "../../componentes/Sidebar/Sidebar.css";
import "./Home.css";

function Home() {
  const [telaAtual, setTelaAtual] = useState("home");

  const irParaHome = () => setTelaAtual("home");

  return (

    <div>
      <Navbar />


    <div style={{ display: "flex" }}>
      {/* Sidebar */}
      <Sidebar onHomeClick={irParaHome} />

      {/* Área principal */}
      <div style={{ flex: 1, padding: "20px" }}>
        {telaAtual === "home"}
        {/* Você pode renderizar outras telas aqui */}
      </div>
      </div>
    </div>
  );
}

export default Home;