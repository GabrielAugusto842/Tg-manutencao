import React, { useState } from "react";
import Sidebar from "../Sidebar/Sidebar.jsx";
import Navbar from "../Navbar/Navbar.jsx"
import "../Navbar/Navbar.css"; 
import "../Sidebar/Sidebar.css";
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