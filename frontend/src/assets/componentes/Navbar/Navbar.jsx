import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Navbar.css";
import { 
  FaUserCircle, 
  FaChevronDown, 
  FaArrowRight, 
  FaAlignJustify,
  FaHome,
  FaChartLine,
  FaUsers,
  FaTools,
  FaFileAlt,
  FaAngleDown,
  FaAngleUp
} from "react-icons/fa";
import { IoRefreshCircleOutline } from "react-icons/io5";

const Navbar = ({ title, user }) => {
  const navigate = useNavigate();
  const [openProfile, setOpenProfile] = useState(false);
  const [openMenu, setOpenMenu] = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState(null);
  const profileRef = useRef();
  const menuRef = useRef();

  // Estado para dados do usuário
  const [userData, setUserData] = useState({ 
    name: "Usuário", 
    email: "email@exemplo.com",
    cargo: ""
  });

  // Carrega dados do usuário
  useEffect(() => {
    try {
      // Tenta primeiro usar o 'user' passado pelo Layout
      if (user && user.nome) {
        setUserData({
          name: user.nome,
          email: user.email || "email@exemplo.com",
          cargo: user.cargo || ""
        });
      } else {
        // Fallback para localStorage
        const storedUser = localStorage.getItem("user");
        if (storedUser && storedUser !== "undefined" && storedUser !== "null") {
          const parsedUser = JSON.parse(storedUser);
          if (parsedUser && parsedUser.nome) {
            setUserData({
              name: parsedUser.nome,
              email: parsedUser.email || "email@exemplo.com",
              cargo: parsedUser.cargo || ""
            });
          }
        }
      }
    } catch (error) {
      console.error("Erro ao carregar usuário:", error);
      localStorage.removeItem("user");
    }
  }, [user]);

  // Funções de permissão (mesma lógica do Sidebar)
  const cargoUsuario = userData?.cargo;

  const podeGerenciarUsuarios = cargoUsuario === "Administrador";
  const podeGerenciarEquipamentos = cargoUsuario === "Administrador";
  const podeCadastrarSetor = cargoUsuario === "Administrador";

  const podeCadastrarOrdem = cargoUsuario === "Operador";

  const podeVerTodasOrdens = 
    cargoUsuario === "Gerente de Manutenção" ||
    cargoUsuario === "Operador" ||
    cargoUsuario === "Manutentor";

  const podeVerRelatorios = cargoUsuario === "Gerente de Manutenção";

  const podeVerMinhasOrdens = cargoUsuario === "Manutentor";

  // Toggle do menu hambúrguer
  const toggleMenu = () => {
    setOpenMenu(!openMenu);
    setOpenSubmenu(null);
  };

  // Toggle do submenu
  const toggleSubmenu = (menuName) => {
    setOpenSubmenu(openSubmenu === menuName ? null : menuName);
  };

  // Toggle do menu de perfil
  const toggleProfileMenu = () => {
    setOpenProfile(!openProfile);
  };

  // Funções de navegação
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const handleTrocarSenha = () => {
    setOpenProfile(false);
    navigate("/trocar-senha");
  };

  // Fecha menu ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenu(false);
        setOpenSubmenu(null);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setOpenProfile(false);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Função para navegar e fechar menu
  const navigateAndClose = (path) => {
    navigate(path);
    setOpenMenu(false);
    setOpenSubmenu(null);
  };

  return (
    <header className="navbar">
      {/* Botão do menu hambúrguer */}
      <div className="profile-wrapper" id="menu-wrap" ref={menuRef}>
        <div className="profile-icon-group" onClick={toggleMenu}>
          <FaAlignJustify className="menu-icon" />
        </div>
      </div>

      {/* Menu hambúrguer dropdown */}
      {openMenu && (
        <div className="hamburger-menu" ref={menuRef}>
          {/* Home */}
          <button 
            className="hamburger-item" 
            onClick={() => navigateAndClose("/home")}
          >
            <FaHome style={{ marginRight: "8px" }} /> Home
          </button>

          {/* Ordens de Serviço */}
          {(podeVerTodasOrdens || podeVerMinhasOrdens || podeCadastrarOrdem) && (
            <>
              <button 
                className="hamburger-item has-submenu"
                onClick={() => toggleSubmenu("ordens")}
              >
                <FaChartLine style={{ marginRight: "8px" }} /> Ordens de Serviço
                {openSubmenu === "ordens" ? <FaAngleUp style={{ marginLeft: "auto" }} /> : <FaAngleDown style={{ marginLeft: "auto" }} />}
              </button>
              
              {openSubmenu === "ordens" && (
                <div className="hamburger-submenu">
                  {podeCadastrarOrdem && (
                    <button onClick={() => navigateAndClose("/ordens/cadastrar")}>
                      Cadastrar
                    </button>
                  )}
                  {podeVerTodasOrdens && (
                    <button onClick={() => navigateAndClose("/ordens/visualizar")}>
                      Visualizar
                    </button>
                  )}
                  {podeVerMinhasOrdens && (
                    <button onClick={() => navigateAndClose("/ordens/minhasos")}>
                      Minhas Ordens
                    </button>
                  )}
                </div>
              )}
            </>
          )}

          {/* Usuários */}
          {podeGerenciarUsuarios && (
            <>
              <button 
                className="hamburger-item has-submenu"
                onClick={() => toggleSubmenu("usuarios")}
              >
                <FaUsers style={{ marginRight: "8px" }} /> Usuários
                {openSubmenu === "usuarios" ? <FaAngleUp style={{ marginLeft: "auto" }} /> : <FaAngleDown style={{ marginLeft: "auto" }} />}
              </button>
              
              {openSubmenu === "usuarios" && (
                <div className="hamburger-submenu">
                  <button onClick={() => navigateAndClose("/usuario/visualizar")}>
                    Visualizar
                  </button>
                  <button onClick={() => navigateAndClose("/usuario/cadastrar")}>
                    Cadastrar
                  </button>
                </div>
              )}
            </>
          )}

          {/* Equipamentos */}
          {podeGerenciarEquipamentos && (
            <>
              <button 
                className="hamburger-item has-submenu"
                onClick={() => toggleSubmenu("equipamentos")}
              >
                <FaTools style={{ marginRight: "8px" }} /> Equipamentos
                {openSubmenu === "equipamentos" ? <FaAngleUp style={{ marginLeft: "auto" }} /> : <FaAngleDown style={{ marginLeft: "auto" }} />}
              </button>
              
              {openSubmenu === "equipamentos" && (
                <div className="hamburger-submenu">
                  <button onClick={() => navigateAndClose("/equipamentos/visualizar")}>
                    Visualizar
                  </button>
                  <button onClick={() => navigateAndClose("/equipamentos/cadastrar")}>
                    Cadastrar
                  </button>
                </div>
              )}
            </>
          )}

          {/* Setores */}
          {podeCadastrarSetor && (
            <>
              <button 
                className="hamburger-item has-submenu"
                onClick={() => toggleSubmenu("setores")}
              >
                <FaTools style={{ marginRight: "8px" }} /> Setor
                {openSubmenu === "setores" ? <FaAngleUp style={{ marginLeft: "auto" }} /> : <FaAngleDown style={{ marginLeft: "auto" }} />}
              </button>
              
              {openSubmenu === "setores" && (
                <div className="hamburger-submenu">
                  <button onClick={() => navigateAndClose("/setores/visualizar")}>
                    Visualizar
                  </button>
                  <button onClick={() => navigateAndClose("/setores/cadastrar")}>
                    Cadastrar
                  </button>
                </div>
              )}
            </>
          )}

          {/* Relatórios */}
          {podeVerRelatorios && (
            <button 
              className="hamburger-item" 
              onClick={() => navigateAndClose("/relatorios")}
            >
              <FaFileAlt style={{ marginRight: "8px" }} /> Relatórios
            </button>
          )}
        </div>
      )}

      <div className="navbar-title">{title || "Default Title"}</div>

      <div className="profile-wrapper" ref={profileRef}>
        <div className="profile-icon-group" onClick={toggleProfileMenu}>
          <FaUserCircle className="profile-icon" />
          <FaChevronDown className={`dropdown-arrow-icon ${openProfile ? "open" : ""}`} />
        </div>

        {openProfile && (
          <div className="profile-menu">
            <div className="user-info">
              <FaUserCircle className="user-avatar" />
              <div className="user-details">
                <span className="user-name">{userData.name}</span>
                <span className="user-email">{userData.email}</span>
              </div>
            </div>

            <button className="menu-option" onClick={handleTrocarSenha}>
              <IoRefreshCircleOutline className="option-icon" /> Trocar senha
            </button>

            <button className="menu-option botao-sair" onClick={handleLogout}>
              <FaArrowRight className="option-icon" /> Sair do sistema
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;