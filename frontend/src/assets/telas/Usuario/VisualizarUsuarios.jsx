import React, { useState, useEffect } from "react";
import Layout from "../../componentes/Layout/Layout";
import "../../telas/Usuario/VisualizarUsuarios.css";
import { FaEdit, FaToggleOn, FaToggleOff } from "react-icons/fa";
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

  useEffect(() => {
    const previousTitle = document.title;
    const filtrosAtivos = [];
    if (filtroBusca.trim() !== "") filtrosAtivos.push(`Nome: ${filtroBusca}`);
    if (filtroCargo.trim() !== "") filtrosAtivos.push(`Cargo: ${filtroCargo}`);
    if (filtroSetor.trim() !== "") filtrosAtivos.push(`Setor: ${filtroSetor}`);
    if (filtrosAtivos.length === 0) {
      document.title = "Maintenance Manager - Todos os Usuários";
    } else {
      document.title = `Maintenance Manager - Usuários filtrados (${filtrosAtivos.join(
        " | "
      )})`;
    }
    return () => {
      document.title = previousTitle;
    };
  }, [filtroBusca, filtroCargo, filtroSetor]);

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
  const handleEditar = (id) => {
    console.log("Editando usuário com ID:", id);
    navigate(`/usuario/editar/${id}`);
  };
  if (carregando) return <p>Carregando usuários...</p>;

  // ------------------ //
  // -- EXPORTAR CSV -- //
  // ------------------ //
  const exportarCSV = () => {
    // Aplica os mesmos filtros usados na tabela
    const filtrados = usuarios.filter((u) => {
      const busca = filtroBusca.toLowerCase();
      return (
        (u.nome.toLowerCase().includes(busca) ||
          u.email.toLowerCase().includes(busca)) &&
        (filtroCargo ? u.cargo === filtroCargo : true) &&
        (filtroSetor ? u.setor === filtroSetor : true)
      );
    });

    // Cabeçalho CSV
    const header = ["nome", "email", "cargo", "setor"];

    // Linhas CSV
    const linhas = filtrados.map((u) => [u.nome, u.email, u.cargo, u.setor]);

    // Monta o CSV
    const csv = [
      header.join(","), // Cabeçalho
      ...linhas.map((l) => l.join(",")), // Linhas
    ].join("\n");

    // Correção de acentuação (UTF-8 com BOM)
    const BOM = "\uFEFF";

    const blob = new Blob([BOM + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "relatorio_usuarios.csv";
    a.click();

    URL.revokeObjectURL(url);
  };

  const handleAlternarStatus = async (usuarios) => {
    const novoStatus = usuarios.ativo ? 0 : 1;

    if (
      !window.confirm(
        `Deseja realmente ${novoStatus ? "ATIVAR" : "INATIVAR"} o usuario "${
          usuarios.nome
        }"?`
      )
    )
      return;

    try {
      await api.put(`/usuario/${usuarios.id_usuario}/status`, {
        ativo: novoStatus,
      });

      setUsuarios((prev) =>
        prev.map((u) =>
          u.id_usuario === usuarios.id_usuario ? { ...u, ativo: novoStatus } : u
        )
      );

      setMensagemSucesso(
        `Máquina "${usuarios.nome}" ${
          novoStatus ? "ativada" : "inativada"
        } com sucesso.`
      );
      // eslint-disable-next-line no-unused-vars
    } catch (error) {
      setErro("Erro ao atualizar status da máquina.");
    }
  };

  return (
    <div className="visualizar-usuarios-page" id="print-area">
      {/* ALERTAS */}
      {erro && <div className="alerta-erro">{erro}</div>}
      {mensagemSucesso && (
        <div className="alerta-sucesso">{mensagemSucesso}</div>
      )}

      {/* ===================== */}
      {/* 🔍 ÁREA DE FILTROS   */}
      {/* ===================== */}
      <div className="opcoes-header">
        <div className="filtros-container no-print">
          <input
            type="text"
            placeholder="Buscar nome ou e-mail..."
            className="filtro-input"
            value={filtroBusca}
            onChange={(e) => setFiltroBusca(e.target.value)}
          />

          <select
            className="filtro-select no-print"
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
            className="filtro-select no-print"
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

        {/*-----------------------------------
         BOTÕES DE EXPORTAÇÃO (PDF + CSV) 
        -----------------------------------*/}
        <div className="export-group no-print">
          <button className="botao-csv" onClick={exportarCSV}>
            🗒️ EXPORTAR CSV
          </button>
          <button onClick={() => window.print()} className="botao-pdf">
            📥 EXPORTAR PDF{" "}
          </button>{" "}
        </div>
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
              <th class="no-print">Ações</th>
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

                  <td className="acoes-coluna-icones no-print">
                    <button
                      className="btn-editar"
                      onClick={() => handleEditar(u.id_usuario)}
                    >
                      <FaEdit size={20} />
                    </button>

                    <button
                      className={usuarios.ativo ? "btn-inativar" : "btn-ativar"}
                      onClick={() => handleAlternarStatus(usuarios)}
                    >
                      {usuarios.ativo ? (
                        <FaToggleOff size={22} />
                      ) : (
                        <FaToggleOn size={22} />
                      )}
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
