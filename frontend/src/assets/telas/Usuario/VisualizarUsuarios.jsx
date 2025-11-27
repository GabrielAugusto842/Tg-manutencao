import React, { useState, useEffect } from "react";
import Layout from "../../componentes/Layout/Layout";
import "../../telas/Usuario/VisualizarUsuarios.css";
import { FaEdit, FaTrash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import api from "../../Services/api.jsx";

const API_URL = "http://localhost:3002/api/user";

function VisualizarUsuariosContent({ navigate }) {
  const [usuarios, setUsuarios] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const [mensagemSucesso, setMensagemSucesso] = useState(null);

  // 🔎 Filtros
  const [filtroBusca, setFiltroBusca] = useState("");
  const [filtroCargo, setFiltroCargo] = useState("");
  const [filtroSetor, setFiltroSetor] = useState("");

  // 🔎 Opções dinâmicas
  const [opcoesCargo, setOpcoesCargo] = useState([]);
  const [opcoesSetor, setOpcoesSetor] = useState([]);

  // ==========================
  //  BUSCAR USUÁRIOS
  // ==========================
  const buscarUsuarios = async () => {
    try {
      setCarregando(true);
      setErro(null);

      const resposta = await fetch(API_URL, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!resposta.ok) {
        throw new Error(`Erro ao buscar dados.`);
      }

      setUsuarios(await resposta.json());
      // eslint-disable-next-line no-unused-vars
    } catch (e) {
      setErro("Erro ao carregar usuários.");
    } finally {
      setCarregando(false);
    }
  };

  // ==========================
  //  CARREGAR CARGOS & SETORES
  // ==========================
  useEffect(() => {
    const carregarCargos = async () => {
      try {
        const res = await api.get("/cargo");
        setOpcoesCargo(
          res.data.map((c) => ({
            id: c.idCargo,
            nome: c.cargo,
          }))
        );
      } catch (error) {
        console.error("Erro ao carregar cargos", error);
      }
    };

    const carregarSetores = async () => {
      try {
        const res = await api.get("/setores");
        setOpcoesSetor(
          res.data.map((s) => ({
            id: s.idSetor,
            nome: s.nomeSetor,
          }))
        );
      } catch (error) {
        console.error("Erro ao carregar setores", error);
      }
    };

    carregarCargos();
    carregarSetores();
  }, []);

  useEffect(() => {
    buscarUsuarios();
  }, []);

  // ==========================
  //   EDITAR E DELETAR
  // ==========================
  const handleEditar = (id) => navigate(`/usuario/editar/${id}`);

  const handleDeletar = async (id) => {
    const usuario = usuarios.find((u) => u.id_usuario === id);

    if (!window.confirm(`Deseja excluir "${usuario.nome}"?`)) return;

    try {
      const resposta = await fetch(`${API_URL}/id/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      if (!resposta.ok) throw new Error("Erro ao deletar.");

      setUsuarios((prev) => prev.filter((u) => u.id_usuario !== id));
      setMensagemSucesso(`Usuário "${usuario.nome}" deletado.`);
      // eslint-disable-next-line no-unused-vars
    } catch (e) {
      setErro("Erro ao excluir usuário.");
    }
  };

  // ==========================
  //      LOADING
  // ==========================
  if (carregando) return <p>Carregando usuários...</p>;

  return (
    <div className="visualizar-usuarios-page">
      {/* ALERTAS */}
      {erro && <div className="alerta-erro">{erro}</div>}
      {mensagemSucesso && (
        <div className="alerta-sucesso">{mensagemSucesso}</div>
      )}

      {/* ===================== */}
      {/* 🔍 ÁREA DE FILTROS   */}
      {/* ===================== */}
      <div className="filtros-container">
        <input
          type="text"
          placeholder="Buscar nome ou e-mail..."
          className="filtro-input"
          value={filtroBusca}
          onChange={(e) => setFiltroBusca(e.target.value)}
        />

        <select
          className="filtro-select"
          value={filtroCargo}
          onChange={(e) => setFiltroCargo(e.target.value)}
        >
          <option value="">Cargo (Todos)</option>
          {opcoesCargo.map((cargo) => (
            <option key={cargo.id} value={cargo.nome}>
              {cargo.nome}
            </option>
          ))}
        </select>

        <select
          className="filtro-select"
          value={filtroSetor}
          onChange={(e) => setFiltroSetor(e.target.value)}
        >
          <option value="">Setor (Todos)</option>
          {opcoesSetor.map((setor) => (
            <option key={setor.id} value={setor.nome}>
              {setor.nome}
            </option>
          ))}
        </select>
      </div>

      {/* ===================== */}
      {/* 📋 TABELA DE USUÁRIOS */}
      {/* ===================== */}
      <div className="tabela-wrapper">
        <table className="tabela-usuarios">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Email</th>
              <th>Cargo</th>
              <th>Setor</th>
              <th>Ações</th>
            </tr>
          </thead>

          <tbody>
            {usuarios
              .filter((u) => {
                const busca = filtroBusca.toLowerCase();
                return (
                  (u.nome.toLowerCase().includes(busca) ||
                    u.email.toLowerCase().includes(busca)) &&
                  (filtroCargo ? u.cargo === filtroCargo : true) &&
                  (filtroSetor ? u.setor === filtroSetor : true)
                );
              })
              .map((u) => (
                <tr key={u.id_usuario}>
                  <td>{u.nome}</td>
                  <td>{u.email}</td>
                  <td>{u.cargo}</td>
                  <td>{u.setor}</td>

                  <td className="acoes-coluna-icones">
                    <button
                      className="btn-editar"
                      onClick={() => handleEditar(u.id_usuario)}
                    >
                      <FaEdit size={20} />
                    </button>

                    <button
                      className="btn-deletar"
                      onClick={() => handleDeletar(u.id_usuario)}
                    >
                      <FaTrash size={20} />
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function VisualizarUsuarios() {
  const navigate = useNavigate();
  return (
    <Layout title="Visualizar Usuários">
      <VisualizarUsuariosContent navigate={navigate} />
    </Layout>
  );
}
