import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Navbar.css";
import { FaUserCircle, FaChevronDown, FaArrowRight } from "react-icons/fa";
import { IoRefreshCircleOutline } from "react-icons/io5";

const Navbar = ({ title }) => {
  const navigate = useNavigate();
  const [perfilAberto, setPerfilAberto] = useState(false);
  const perfilRef = useRef();
  const [usuario, setUsuario] = useState({
    nome: "Usuário",
    email: "email@exemplo.com",
  });

  useEffect(() => {
    try {
      const usuarioArmazenado = localStorage.getItem("user");

      // Tenta fazer o parsing do usuário armazenado
      if (usuarioArmazenado) {
        const usuarioParseado = JSON.parse(usuarioArmazenado);

        if (usuarioParseado && usuarioParseado.nome && usuarioParseado.email) {
          setUsuario(usuarioParseado); // Atualiza o estado com o usuário válido
        } else {
          console.warn("Usuário inválido no localStorage:", usuarioParseado);
        }
      } else {
        console.warn("Nenhum usuário encontrado no localStorage.");
      }
    } catch (erro) {
      console.error("Erro ao carregar usuário:", erro);
      localStorage.removeItem("user"); // Remove dados corrompidos
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const toggleMenuPerfil = () => {
    setPerfilAberto(!perfilAberto);
  };

  const handleTrocarSenha = () => {
    setPerfilAberto(false);
    navigate("/trocar-senha");
  };

  useEffect(() => {
    const handleClickFora = (evento) => {
      if (perfilRef.current && !perfilRef.current.contains(evento.target)) {
        setPerfilAberto(false);
      }
    };
    document.addEventListener("mousedown", handleClickFora);
    return () => document.removeEventListener("mousedown", handleClickFora);
  }, []);

  return (
    <header className="navbar">
      <div className="navbar-title">{title || "Default Title"}</div>

      <div className="profile-wrapper" ref={perfilRef}>
        <div className="profile-icon-group" onClick={toggleMenuPerfil}>
          <FaUserCircle className="profile-icon" />
          <FaChevronDown
            className={`dropdown-arrow-icon ${perfilAberto ? "open" : ""}`}
          />
        </div>

        {perfilAberto && (
          <div className="profile-menu">
            {/*Informações do Usuário */}
            <div className="user-info">
              <FaUserCircle className="user-avatar" />
              <div className="user-details">
                <span className="user-name">{usuario.nome}</span>
                <span className="user-email">{usuario.email}</span>
              </div>
            </div>

            {/* Menu de Ações */}
            <button
              className="menu-option trocar-senha"
              onClick={handleTrocarSenha}
            >
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
