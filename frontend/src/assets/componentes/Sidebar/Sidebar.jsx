import React from 'react';
import './Sidebar.css';
import { FaHome, FaClipboardList, FaUsers, FaTools, FaFileAlt, FaAngleDown, FaAngleUp, FaChartLine} from "react-icons/fa";
import { useState } from 'react';
import { useNavigate } from "react-router-dom";

function Sidebar() {
  const [openMenu, setOpenMenu] = useState(null);
  const navigate = useNavigate();

  const toggleMenu = (menuName) => {
    setOpenMenu(openMenu === menuName ? null : menuName);
  };

  return (
    <div className="sidebar">

      <div className="menu">
        <div className='menu-item' onClick={() => navigate("/home")}>
        <FaHome className="icon" />
        <span translate="no"> Home </span>
        </div>

        <div 
          className={`menu-item ${openMenu == "Ordens de Serviço" ? 'active' : ''}`} 
          onClick={() => toggleMenu("Ordens de Serviço")}>
          <FaChartLine className="icon" />
          <span>Ordens de Serviço</span>
          {openMenu === "Ordens de Serviço" ? <FaAngleUp/> : <FaAngleDown/>}
        </div>
        {openMenu === "Ordens de Serviço" && (
          <div className="submenu">
              <button onClick={() => navigate("/ordens/cadastrar")}>Cadastrar</button>
              <button onClick={() => navigate("/ordens/visualizar")}>Visualizar</button>
              <button onClick={() => navigate("/ordens/minhasos")}>Minhas Ordens de Serviço</button>
            </div>
      )}

       {/* Usuário */}
        <div 
        className={`menu-item ${openMenu == "usuario" ? 'active' : ''}`} 
        onClick={() => toggleMenu("usuario")}>
          <FaUsers className="icon" />
          <span>Usuários</span>
          {openMenu === "usuario" ? <FaAngleUp /> : <FaAngleDown />}
        </div>
        {openMenu === "usuario" && (
          <div className="submenu">
            <button onClick={() => navigate("/usuario/visualizar")}>Visualizar</button>
            <button onClick={() => navigate("/usuario/cadastrar")}>Cadastrar</button>
          </div>
        )}

        {/* Equipamentos */}
        <div 
          className={`menu-item ${openMenu == "equipamentos" ? 'active' : ''}`} 
          onClick={() => toggleMenu("equipamentos")}>
          <FaTools className="icon" />
          <span>Equipamentos</span>
          {openMenu === "equipamentos" ? <FaAngleUp /> : <FaAngleDown />}
        </div>
        {openMenu === "equipamentos" && (
          <div className="submenu">
            <button onClick={() => navigate("/equipamentos/visualizar")}>Visualizar</button>
            <button onClick={() => navigate("/equipamentos/cadastrar")}>Cadastrar</button>
          </div>
        )}

        {/* Relatórios */}
        <div className="menu-item" onClick= {() => navigate("/relatorios")}>
          <FaFileAlt className="icon" />
          <span>Relatórios</span>
        </div>
      </div>
      <div className="logo">
      <img src="src/assets/logo-company1.png" alt="Logo" />
    </div>
    </div>
    
  );
}

export default Sidebar;