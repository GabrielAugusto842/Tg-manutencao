import React, { useState, useEffect } from "react";
import Layout from "../../componentes/Layout/Layout";
import "../../telas/Ordens/MinhasOrdens.css";
import { FaClipboardCheck } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import api from "../../Services/api.jsx";

function VisualizarOrdensContent({ user }) {
  const [ordens, setOrdens] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState(null);
  const [mensagemSucesso, setMensagemSucesso] = useState(null);
  const navigate = useNavigate();

  // 🔍 FILTROS
  const [filtroBuscaMaquina, setFiltroBuscaMaquina] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("");

  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");

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

  const idUsuario = user?.id_usuario;

  // Busca ordens do banco
  const buscarOrdens = async () => {
    try {
      setCarregando(true);
      setErro(null);
      setMensagemSucesso(null);

      const resposta = await api.get(`/os/manutentor/${idUsuario}`);
      const dados = resposta.data;

      setOrdens(dados);
    } catch (e) {
      console.error("Erro ao buscar ordens:", e);
      // Ajuste a mensagem de erro para tentar obter o detalhe da API se disponível
      const mensagem =
        e.response?.data?.message || "Erro ao carregar Ordens de Serviço";
      setErro(mensagem);
    } finally {
      setCarregando(false);
    }
  };

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

  useEffect(() => {
    if (idUsuario) buscarOrdens();
  }, [idUsuario]);

  const handlePreencher = (id) => {
    navigate(`/preencher-os/${id}`);
  };

  // =============================
  // 🔎 FILTROS
  // =============================
  const ordensFiltradas = ordens.filter((o) => {
    // Filtra por texto digitado
    if (
      !o.nome_maquina.toLowerCase().includes(filtroBuscaMaquina.toLowerCase())
    )
      return false;

    if (filtroStatus && o.status !== filtroStatus) return false;

    // Filtra por período (apenas se AMBAS as datas forem preenchidas)
    const dataAbertura = o.data_abertura ? new Date(o.data_abertura) : null;

    const inicio = dataInicio ? new Date(dataInicio + "T00:00:00") : null;
    const fim = dataFim ? new Date(dataFim + "T23:59:59") : null;

    // ❌ Apenas 1 data preenchida → NÃO filtra por período
    if ((dataInicio && !dataFim) || (!dataInicio && dataFim)) {
      return true;
    }

    // ✔ Ambas as datas preenchidas → agora sim filtra
    if (dataInicio && dataFim) {
      const dentroDoPeriodo =
        (!inicio || dataAbertura >= inicio) && (!fim || dataAbertura <= fim);

      if (!dentroDoPeriodo) return false;
    }

    return true;
  });

  return (
    <div className="visualizar-minhas-ordens-page">
      {/* FILTROS */}
      <div className="filtros-linha">
        <div className="filtros-linha mobile-filtros-coluna filtros-wrap">
          {/* BUSCAR POR MÁQUINA */}
          <input
            type="text"
            placeholder="Buscar máquina..."
            className="filtro-input"
            value={filtroBuscaMaquina}
            onChange={(e) => setFiltroBuscaMaquina(e.target.value)}
          />

          {/* SELECT STATUS */}
          <select
            className="filtro-select"
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value)}
          >
            <option value="">Status (Todos)</option>
            <option value="Aberto">Aberto</option>
            <option value="Em andamento">Em andamento</option>
            <option value="Finalizado">Finalizado</option>
          </select>
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

      {/* LOADING */}
      {carregando && (
        <p style={{ fontWeight: "bold", fontSize: 18 }}>Carregando ordens...</p>
      )}

      {/* ERRO */}
      {!carregando && erro && (
        <div className="alerta-erro" style={{ color: "red", marginBottom: 15 }}>
          {erro}
        </div>
      )}

      {/* SUCESSO */}
      {!carregando && mensagemSucesso && (
        <div
          className="alerta-sucesso"
          style={{ color: "green", marginBottom: 15 }}
        >
          {mensagemSucesso}
        </div>
      )}

      {/* SEM ORDENS */}
      {!carregando && ordensFiltradas.length === 0 && (
        <p>Nenhuma Ordem encontrada.</p>
      )}

      {/* TABELA */}
      {!carregando && ordensFiltradas.length > 0 && (
        <div className="tabela-wrapper">
          <table className="tabela-minhas-ordens">
            <thead>
              <tr>
                <th>Máquina</th>
                <th>Descrição</th>
                <th>Data Abertura</th>
                <th>Data Início</th>
                <th>Data Término</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>

            <tbody>
              {ordensFiltradas.map((ordem) => (
                <tr key={ordem.id_ord_serv}>
                  <td>{ordem.nome_maquina}</td>
                  <td>{ordem.descricao}</td>
                  <td>{formatarDataBrasil(ordem.data_abertura)}</td>
                  <td>{formatarDataBrasil(ordem.data_inicio)}</td>
                  <td>{formatarDataBrasil(ordem.data_termino)}</td>

                  <td
                    style={{
                      color: corStatus(ordem.status),
                      fontWeight: "bold",
                    }}
                  >
                    {ordem.status}
                  </td>

                  <td className="acoes-coluna-icones">
                    {ordem.status !== "Finalizado" && (
                      <button
                        className="btn-preencher"
                        onClick={() => handlePreencher(ordem.id_ord_serv)}
                        title="Preencher O.S"
                      >
                        <FaClipboardCheck size={20} />
                      </button>
                    )}
                  </td>
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
    <Layout title="Minhas Ordens de Serviço">
      <VisualizarOrdensContent user={user} />
    </Layout>
  );
}
