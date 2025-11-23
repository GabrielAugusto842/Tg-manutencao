import React, { useState, useEffect } from "react";
import Layout from "../../componentes/Layout/Layout";
import "../../telas/Ordens/MinhasOrdens.css";
import { FaCheckCircle, FaEdit, FaTrash } from "react-icons/fa";

const API_URL = "http://localhost:3002/api/os";

function VisualizarOrdensContent({ user }) {
  const [ordens, setOrdens] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState(null);
  const [mensagemSucesso, setMensagemSucesso] = useState(null);

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

  // Busca ordens REAIS do banco
  const buscarOrdens = async () => {
    try {
      setCarregando(true);
      setErro(null);
      setMensagemSucesso(null);

      const resposta = await fetch(`${API_URL}/manutentor/${idUsuario}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!resposta.ok) throw new Error("Erro ao buscar ordens");

      const dados = await resposta.json();

      console.log("Dados vindos da rota minhasOS:", dados);
      setOrdens(dados);
    } catch (e) {
      console.error(e);
      setErro("Erro ao carregar Ordens de Serviço");
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

  const handleAceitar = (id) => {
    alert(`Aceitar ordem ${id}`);
  };

  const handleEditar = (id) => {
    const ordemAlvo = ordens.find((e) => e.id_ord_serv === id);
    alert(
      `Editar: ${ordemAlvo?.descricao || "Ordem"} (${ordemAlvo?.custo || 0})`
    );
  };

  const handleExcluir = (id) => {
    alert(`Excluir ordem ${id}`);
  };

  if (carregando) {
    return (
      <div className="container">
        <p>Carregando Ordens de Serviço...</p>
      </div>
    );
  }

  return (
    <div className="visualizar-ordens-page">
      {erro && (
        <div className="alerta-erro" style={{ color: "red", marginBottom: 15 }}>
          {erro}
        </div>
      )}
      {mensagemSucesso && (
        <div
          className="alerta-sucesso"
          style={{ color: "green", marginBottom: 15 }}
        >
          {mensagemSucesso}
        </div>
      )}

      {ordens.length === 0 ? (
        <p>Nenhuma Ordem encontrada para este manutentor.</p>
      ) : (
        <div className="tabela-wrapper">
          <table className="tabela-ordens">
            <thead>
              <tr>
                <th>Descrição</th>
                <th>Data Abertura</th>
                <th>Data Início</th>
                <th>Data Término</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>

            <tbody>
              {ordens.map((ordem) => (
                <tr key={ordem.id_ord_serv}>
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
                    <button
                      onClick={() => handleAceitar(ordem.id_ord_serv)}
                      style={{
                        color: "green",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                      }}
                    >
                      <FaCheckCircle size={20} />
                    </button>

                    <button
                      onClick={() => handleEditar(ordem.id_ord_serv)}
                      style={{
                        color: "blue",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                      }}
                    >
                      <FaEdit size={20} />
                    </button>

                    <button
                      onClick={() => handleExcluir(ordem.id_ord_serv)}
                      style={{
                        color: "red",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                      }}
                    >
                      <FaTrash size={20} />
                    </button>
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
