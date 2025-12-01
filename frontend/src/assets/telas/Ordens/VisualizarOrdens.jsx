import React, { useState, useEffect } from "react";
import Layout from "../../componentes/Layout/Layout";
import "../../telas/Ordens/VisualizarOrdens.css";
import { FaEdit, FaTrash, FaEye, FaCheckCircle } from "react-icons/fa";
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

  const [filtroBuscaMaquina, setFiltroBuscaMaquina] = useState("");
  const [filtroStatusNovo, setFiltroStatusNovo] = useState("");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");

  useEffect(() => {
    const previousTitle = document.title;
    const filtrosAtivos = [];
    if (filtroBuscaMaquina.trim() !== "")
      filtrosAtivos.push(`Máquina: ${filtroBuscaMaquina}`);
    if (filtroStatusNovo.trim() !== "")
      filtrosAtivos.push(`Status: ${filtroStatusNovo}`);
    if (dataInicio.trim() !== "") filtrosAtivos.push(`Início: ${dataInicio}`);
    if (dataFim.trim() !== "") filtrosAtivos.push(`Fim: ${dataFim}`);

    document.title =
      filtrosAtivos.length === 0
        ? "Maintenance Manager - Todas as Ordens"
        : `Maintenance Manager - Ordens filtradas (${filtrosAtivos.join(
            " | "
          )})`;

    return () => {
      document.title = previousTitle;
    };
  }, [filtroBuscaMaquina, filtroStatusNovo, dataInicio, dataFim]);

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
    const dataFormatada = data.toLocaleDateString("pt-BR", {
      timeZone: "America/Sao_Paulo",
    });
    const horaFormatada = data.toLocaleTimeString("pt-BR", {
      timeZone: "America/Sao_Paulo",
      hour: "2-digit",
      minute: "2-digit",
    });
    return (
      <div className="data-hora">
        <div className="data">{dataFormatada}</div>{" "}
        <div className="hora">{horaFormatada}</div>
      </div>
    );
  }

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

  const handleAceitar = async (id) => {
    if (!window.confirm("Tem certeza que deseja aceitar esta O.S?")) return;

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

  const handleEditar = (idOrdServ) => {
    if (!podeEditarGM) {
      alert("Você não tem permissão para editar esta O.S.");
      return;
    }
    navigate(`/ordens/editar/${idOrdServ}`);
  };

  const handleVisualizar = (id) => {
    window.open(`/ordens/${id}`, "_blank");
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
      setOrdens((prev) => prev.filter((o) => o.idOrdServ !== id));
    } catch (e) {
      setErro(e.message);
    } finally {
      setCarregando(false);
    }
  };

  const ordensFiltradas = ordens.filter((o) => {
    if (
      !o.nomeMaquina?.toLowerCase().includes(filtroBuscaMaquina.toLowerCase())
    )
      return false;
    if (filtroStatusNovo && o.status !== filtroStatusNovo) return false;

    const dataAbertura = o.dataAbertura ? new Date(o.dataAbertura) : null;
    const inicio = dataInicio ? new Date(dataInicio + "T00:00:00") : null;
    const fim = dataFim ? new Date(dataFim + "T23:59:59") : null;

    if ((dataInicio && !dataFim) || (!dataInicio && dataFim)) return true;
    if (dataInicio && dataFim)
      return (
        (!inicio || dataAbertura >= inicio) && (!fim || dataAbertura <= fim)
      );

    return true;
  });

  if (carregando) return <div className="container">Carregando ordens...</div>;

  return (
    <div className="visualizar-ordens-page" id="print-area">
      <div className="filtros-linha no-print">
        <div className="filtros-container">
          <input
            type="text"
            placeholder="Buscar máquina..."
            className="filtro-input"
            value={filtroBuscaMaquina}
            onChange={(e) => setFiltroBuscaMaquina(e.target.value)}
          />
          {!["Manutentor"].includes(cargoUsuario) && (
            <select
              className="filtro-select"
              value={filtroStatusNovo}
              onChange={(e) => setFiltroStatusNovo(e.target.value)}
            >
              <option value="">Status (Todos)</option>
              <option value="Aberto">Aberto</option>
              <option value="Em andamento">Em andamento</option>
              <option value="Finalizado">Finalizado</option>
            </select>
          )}
        </div>
        <div className="filtro-periodo-container">
          <label className="filtro-periodo-titulo">Buscar por período</label>
          <div className="filtro-periodo-inputs">
            <input
              type="date"
              className="filtro-data"
              value={dataInicio}
              onChange={(e) => setDataInicio(e.target.value)}
            />
            <input
              type="date"
              className="filtro-data"
              value={dataFim}
              onChange={(e) => setDataFim(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="botao-pdf-wrapper no-print">
        {" "}
        <button
          onClick={() => window.print()}
          className="botao-pdf-ordens" /* Classe para o estilo ultra-compacto */
        >
          📥 EXPORTAR PDF{" "}
        </button>{" "}
      </div>

      {erro && <div className="alerta-erro">{erro}</div>}
      {mensagemSucesso && (
        <div className="alerta-sucesso">{mensagemSucesso}</div>
      )}

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
                {!eOperador && <th className="no-print">Ações</th>}
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
                    <td className="acoes-coluna-icones no-print">
                      {podeAceitar && ordem.status === "Aberto" && (
                        <button
                          onClick={() => handleAceitar(ordem.idOrdServ)}
                          title="Aceitar"
                        >
                          <FaCheckCircle size={20} color="green" />
                        </button>
                      )}
                      {(ordem.status === "Em andamento" ||
                        ordem.status === "Finalizado") && (
                        <button
                          onClick={() => handleVisualizar(ordem.idOrdServ)}
                          title="Visualizar"
                          className="btn-visualizar"
                        >
                          <FaEye size={20} color="#1d7eea" />
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
