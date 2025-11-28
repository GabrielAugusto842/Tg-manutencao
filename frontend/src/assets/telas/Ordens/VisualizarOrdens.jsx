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

  // 🔍 FILTROS (iguais ao Minhas OS)
  const [filtroBuscaMaquina, setFiltroBuscaMaquina] = useState("");
  const [filtroStatusNovo, setFiltroStatusNovo] = useState("");

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
    // ------------------------------
    // Buscar por nome da máquina (texto)
    // ------------------------------
    if (
      !o.nomeMaquina?.toLowerCase().includes(filtroBuscaMaquina.toLowerCase())
    )
      return false;

    // ------------------------------
    // Filtrar por status se selecionado
    // ------------------------------
    if (filtroStatusNovo && o.status !== filtroStatusNovo) return false;

    // ------------------------------
    // FILTRAR POR PERÍODO
    // ------------------------------
    const dataAbertura = o.dataAbertura ? new Date(o.dataAbertura) : null;

    const inicio = dataInicio ? new Date(dataInicio + "T00:00:00") : null;
    const fim = dataFim ? new Date(dataFim + "T23:59:59") : null;

    // Apenas uma data preenchida → ignora filtro
    if ((dataInicio && !dataFim) || (!dataInicio && dataFim)) return true;

    // Se ambas preenchidas → filtra
    if (dataInicio && dataFim) {
      const dentroDoPeriodo =
        (!inicio || dataAbertura >= inicio) && (!fim || dataAbertura <= fim);

      if (!dentroDoPeriodo) return false;
    }

    return true;
  });

  if (carregando) return <div className="container">Carregando ordens...</div>;

  return (
    <div className="visualizar-ordens-page">
      {/* FILTROS */}
      <div className="filtros-linha">
        <div className="filtros-container">
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
            value={filtroStatusNovo}
            onChange={(e) => setFiltroStatusNovo(e.target.value)}
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
