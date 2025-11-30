import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaHome,
  FaUsers,
  FaTools,
  FaFileAlt,
  FaChartLine,
  FaAngleDown,
  FaAngleUp,
} from "react-icons/fa";
import logo from "../../logo-company1.png";
import "./Sidebar.css";

function Sidebar({ user }) {
  const [openMenu, setOpenMenu] = useState(null);
  const navigate = useNavigate();

  // Função para alternar a visibilidade dos menus (Abrir os submenus)
  const toggleMenu = (menuName) => {
    setOpenMenu(openMenu === menuName ? null : menuName);
  };

  const cargoUsuario = user?.cargo;

  // Definindo permissões com base no cargo
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

  // Exibição de estado de carregamento caso não exista o usuário
  if (!user) {
    return (
      <div className="sidebar loading">
        <div className="loading-state">Carregando menu...</div>
      </div>
    );
  }

  return (
    <div className="sidebar">
      <div className="menu">
        {/* Menu Página Inicial */}
        <div className="menu-item" onClick={() => navigate("/home")}>
          <FaHome className="icon" />
          <span>Início</span>
        </div>

        {/* Menu Ordens de Serviço */}
        {(podeVerTodasOrdens || podeVerMinhasOrdens || podeCadastrarOrdem) && (
          <>
            <div
              className={`menu-item ${
                openMenu === "Ordens de Serviço" ? "active" : ""
              }`}
              onClick={() => toggleMenu("Ordens de Serviço")}
            >
              <FaChartLine className="icon" />
              <span>Ordens de Serviço</span>
              {openMenu === "Ordens de Serviço" ? (
                <FaAngleUp />
              ) : (
                <FaAngleDown />
              )}
            </div>
            {openMenu === "Ordens de Serviço" && (
              <div className="submenu">
                {podeCadastrarOrdem && (
                  <button onClick={() => navigate("/ordens/cadastrar")}>
                    Cadastrar
                  </button>
                )}
                {podeVerTodasOrdens && (
                  <button onClick={() => navigate("/ordens/visualizar")}>
                    Visualizar
                  </button>
                )}
                {podeVerMinhasOrdens && (
                  <button onClick={() => navigate("/ordens/minhasos")}>
                    Minhas Ordens de Serviço
                  </button>
                )}
              </div>
            )}
          </>
        )}

        {/* Menu Usuários */}
        {podeGerenciarUsuarios && (
          <>
            <div
              className={`menu-item ${openMenu === "usuario" ? "active" : ""}`}
              onClick={() => toggleMenu("usuario")}
            >
              <FaUsers className="icon" />
              <span>Usuários</span>
              {openMenu === "usuario" ? <FaAngleUp /> : <FaAngleDown />}
            </div>
            {openMenu === "usuario" && (
              <div className="submenu">
                <button onClick={() => navigate("/usuario/visualizar")}>
                  Visualizar
                </button>
                <button onClick={() => navigate("/usuario/cadastrar")}>
                  Cadastrar
                </button>
              </div>
            )}
          </>
        )}

        {/* Menu Equipamentos */}
        {podeGerenciarEquipamentos && (
          <>
            <div
              className={`menu-item ${
                openMenu === "equipamentos" ? "active" : ""
              }`}
              onClick={() => toggleMenu("equipamentos")}
            >
              <FaTools className="icon" />
              <span>Equipamentos</span>
              {openMenu === "equipamentos" ? <FaAngleUp /> : <FaAngleDown />}
            </div>
            {openMenu === "equipamentos" && (
              <div className="submenu">
                <button onClick={() => navigate("/equipamentos/visualizar")}>
                  Visualizar
                </button>
                <button onClick={() => navigate("/equipamentos/cadastrar")}>
                  Cadastrar
                </button>
              </div>
            )}
          </>
        )}

        {/* Menu Setores */}
        {podeCadastrarSetor && (
          <>
            <div
              className={`menu-item ${openMenu === "setor" ? "active" : ""}`}
              onClick={() => toggleMenu("setor")}
            >
              <FaTools className="icon" />
              <span>Setor</span>
              {openMenu === "setor" ? <FaAngleUp /> : <FaAngleDown />}
            </div>
            {openMenu === "setor" && (
              <div className="submenu">
                <button onClick={() => navigate("/setores/visualizar")}>
                  Visualizar
                </button>
                <button onClick={() => navigate("/setores/cadastrar")}>
                  Cadastrar
                </button>
              </div>
            )}
          </>
        )}

        {/* Menu Relatórios */}
        {podeVerRelatorios && (
          <div className="menu-item" onClick={() => navigate("/relatorios")}>
            <FaFileAlt className="icon" />
            <span>Relatórios</span>
          </div>
        )}
      </div>

      {/* Logo */}
      <div className="logo">
        <img src={logo} alt="Logo" />
      </div>
    </div>
  );
}

export default Sidebar;
