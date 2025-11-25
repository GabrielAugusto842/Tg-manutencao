import React, { useState, useEffect } from "react";
import Layout from "../../componentes/Layout/Layout";
import "../../telas/Ordens/VisualizarOrdens.css?v=1.0.9";
import { FaCheckCircle, FaEdit, FaTrash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const API_URL = "http://localhost:3002/api/os";

function VisualizarOrdensContent({ user }) {
  const [ordens, setOrdens] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const [mensagemSucesso, setMensagemSucesso] = useState(null);
  const navigate = useNavigate();

  const dadosUsuario = JSON.parse(localStorage.getItem("user"));
  const usuarioLogadoId = dadosUsuario?.id_usuario;

  const [filtroMaquina, setFiltroMaquina] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("");

  const corStatus = (status) => {
    switch (status) {
      case "Aberto":
        return "blue";
      case "Em andamento":
        return "orange";
      case "Finalizado":
        return "green";
      default:
        return "black";
    }
  };

  const cargoUsuario = user?.cargo;
  const eOperador = cargoUsuario === "Operador";

  const podeEditarGM = cargoUsuario === "Gerente de Manutenção";
  const podeExcluirGM = cargoUsuario === "Gerente de Manutenção";
  const podeAceitar = cargoUsuario === "Manutentor";

  function formatarDataBrasil(dataString) {
    if (!dataString) return "-";

    const data = new Date(dataString);

    return data.toLocaleString("pt-BR", {
      timeZone: "America/Sao_Paulo",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  // Busca ordens do backend
  const buscarOrdens = async () => {
    try {
      setCarregando(true);
      setErro(null);
      setMensagemSucesso(null);

      let url = API_URL;
      if (cargoUsuario === "Manutentor") url = `${API_URL}/abertas`;

      const resposta = await fetch(url, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      if (!resposta.ok) throw new Error("Erro ao buscar ordens");

      const dados = await resposta.json();
      console.log("OS recebidas:", dados);
      setOrdens(dados);
    } catch (e) {
      setErro("Não foi possível carregar as ordens de serviço.");
      console.error(e);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    if (user) buscarOrdens();
  }, [user]);

  // Ações
  const handleAceitar = async (id) => {
    const confirmar = window.confirm(
      "Tem certeza que deseja aceitar esta O.S?"
    );
    if (!confirmar) return; // Sai se o usuário clicar em "Cancelar"

    try {
      setCarregando(true);

      const resposta = await fetch(`${API_URL}/aceitar/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ idUsuario: usuarioLogadoId }),
      });

      if (!resposta.ok) throw new Error("Erro ao aceitar O.S");

      navigate("/ordens/minhasos");
    } catch (e) {
      setErro(e.message);
    } finally {
      setCarregando(false);
    }
  };

  const handleEditar = (id) => {
    alert(`Editar ordem ${id}`);
  };

  const handleExcluir = async (id) => {
    if (!window.confirm(`Deseja excluir a ordem ${id}?`)) return;
    try {
      setCarregando(true);
      const resposta = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (!resposta.ok) throw new Error("Erro ao excluir a ordem");
      setMensagemSucesso(`Ordem ${id} excluída com sucesso!`);
      setOrdens((prev) => prev.filter((o) => o.id_ord_serv !== id));
    } catch (e) {
      setErro(e.message);
    } finally {
      setCarregando(false);
    }
  };

  // Aplica filtros
  const ordensFiltradas = ordens.filter((o) => {
    return (
      (filtroMaquina === "" || o.nomeMaquina === filtroMaquina) &&
      (filtroStatus === "" || o.status === filtroStatus)
    );
  });

  if (carregando) return <div className="container">Carregando ordens...</div>;

  return (
    <div className="visualizar-ordens-page">
      {erro && <div className="alerta-erro">{erro}</div>}
      {mensagemSucesso && (
        <div className="alerta-sucesso">{mensagemSucesso}</div>
      )}

      {/* FILTROS */}
      <div
        style={{
          display: "flex",
          gap: "20px",
          marginBottom: "15px",
          flexWrap: "wrap",
        }}
      >
        <div>
          <label htmlFor="filtroMaquina">Filtrar por Máquina:</label>
          <select
            id="filtroMaquina"
            value={filtroMaquina}
            onChange={(e) => setFiltroMaquina(e.target.value)}
            style={{ marginLeft: "5px" }}
          >
            <option value="">Todas</option>
            {Array.from(new Set(ordens.map((o) => o.nomeMaquina))).map(
              (maquina, i) => (
                <option key={i} value={maquina}>
                  {maquina}
                </option>
              )
            )}
          </select>
        </div>

        <div>
          <label htmlFor="filtroStatus">Filtrar por Status:</label>
          <select
            id="filtroStatus"
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value)}
            style={{ marginLeft: "5px" }}
          >
            <option value="">Todos</option>
            {Array.from(new Set(ordens.map((o) => o.status))).map(
              (status, i) => (
                <option key={i} value={status}>
                  {status}
                </option>
              )
            )}
          </select>
        </div>
      </div>

      {ordensFiltradas.length === 0 ? (
        <p>Nenhuma ordem de serviço encontrada.</p>
      ) : (
        <div className="tabela-wrapper">
          <table className="tabela-ordens">
            <thead>
              <tr>
                <th>Máquina</th>
                <th>Setor</th>
                <th>Descrição</th>
                <th>Data Abertura</th>
                <th>Data Início</th>
                <th>Data Término</th>
                <th>Usuário</th>
                <th>Status</th>
                {!eOperador && <th>Ações</th>}
              </tr>
            </thead>
            <tbody>
              {ordensFiltradas.map((ordem) => (
                <tr key={ordem.idOrdServ}>
                  <td>{ordem.nomeMaquina}</td>
                  <td>{ordem.setor}</td>
                  <td>{ordem.descricao}</td>
                  <td>{formatarDataBrasil(ordem.dataAbertura)}</td>
                  <td>{formatarDataBrasil(ordem.dataInicio)}</td>
                  <td>{formatarDataBrasil(ordem.dataTermino)}</td>
                  <td>{ordem.nomeUsuario || "-"}</td>
                  <td
                    style={{
                      color: corStatus(ordem.status),
                      fontWeight: "bold",
                    }}
                  >
                    {ordem.status}
                  </td>

                  {!eOperador && (
                    <td className="acoes-coluna-icones">
                      {podeAceitar && ordem.status === "Aberto" && (
                        <button
                          onClick={() => handleAceitar(ordem.idOrdServ)}
                          title="Aceitar"
                        >
                          <FaCheckCircle size={20} color="green" />
                        </button>
                      )}

                      {podeEditarGM && (
                        <button
                          onClick={() => handleEditar(ordem.idOrdServ)}
                          title="Editar"
                        >
                          <FaEdit size={20} color="blue" />
                        </button>
                      )}
                      {podeExcluirGM && (
                        <button
                          onClick={() => handleExcluir(ordem.idOrdServ)}
                          title="Excluir"
                        >
                          <FaTrash size={20} color="red" />
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default function VisualizarOrdens({ user }) {
  return (
    <Layout title="Visualizar Ordens de Serviço">
      <VisualizarOrdensContent user={user} />
    </Layout>
  );
}
