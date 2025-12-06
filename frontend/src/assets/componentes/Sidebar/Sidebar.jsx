import React from "react";
import "./Sidebar.css";
import {
  FaHome,
  FaClipboardList,
  FaUsers,
  FaTools,
  FaFileAlt,
  FaAngleDown,
  FaAngleUp,
  FaChartLine,
} from "react-icons/fa";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../../logo-company1.png";

function Sidebar({ user }) {
  const [openMenu, setOpenMenu] = useState(null);
  const navigate = useNavigate();

  const toggleMenu = (menuName) => {
    setOpenMenu(openMenu === menuName ? null : menuName);
  };

  const cargoUsuario = user?.cargo;

  const podeGerenciarUsuarios = cargoUsuario === "Administrador";
  const podeGerenciarEquipamentos = cargoUsuario === "Administrador";
  const podeCadastrarSetor = cargoUsuario === "Administrador";

  const podeCadastrarOrdem = cargoUsuario === "Operador";
  const podeVerLog = cargoUsuario === "Gerente de Manutenção";

  const podeVerTodasOrdens =
    cargoUsuario === "Gerente de Manutenção" ||
    cargoUsuario === "Operador" ||
    cargoUsuario === "Manutentor";

  const podeVerRelatorios = cargoUsuario === "Gerente de Manutenção";

  const podeVerMinhasOrdens = cargoUsuario === "Manutentor";

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
        <div className="menu-item" onClick={() => navigate("/home")}>
          <FaHome className="icon" />
          <span translate="no"> Home </span>
        </div>

        {(podeVerTodasOrdens || podeVerMinhasOrdens || podeCadastrarOrdem) && (
          <>
            <div
              className={`menu-item ${
                openMenu == "Ordens de Serviço" ? "active" : ""
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

        {/* Usuário */}
        {podeGerenciarUsuarios && (
          <>
            <div
              className={`menu-item ${openMenu == "usuario" ? "active" : ""}`}
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

        {/* Equipamentos */}
        {podeGerenciarEquipamentos && (
          <>
            <div
              className={`menu-item ${
                openMenu == "equipamentos" ? "active" : ""
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

        {/* Setores */}
        {podeCadastrarSetor && (
          <>
            <div
              className={`menu-item ${openMenu == "setor" ? "active" : ""}`}
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

        {/* Relatórios */}
        {podeVerRelatorios && (
          <div className="menu-item" onClick={() => navigate("/relatorios")}>
            <FaFileAlt className="icon" />
            <span>Relatórios</span>
          </div>
        )}
      </div>
      {podeVerLog && (
        <div className="menu-item" onClick={() => navigate("/logs")}>
          <FaClipboardList className="icon" />
          <span>Log do Sistema</span>
        </div>
      )}
      <div className="logo">
        <img src={logo} alt="Logo" />
      </div>
    </div>
  );
}

export default Sidebar;
