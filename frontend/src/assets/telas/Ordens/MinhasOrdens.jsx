import React, { useState, useEffect } from "react";
import Layout from "../../componentes/Layout/Layout";
import "../../telas/Ordens/VisualizarOrdens.css";
import { FaCheckCircle, FaEdit, FaTrash } from "react-icons/fa";

const API_URL = "http://localhost:3002/api/os";

function VisualizarOrdensContent({ user }) {
  const [ordens, setOrdens] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState(null);
  const [mensagemSucesso, setMensagemSucesso] = useState(null);

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
      setOrdens(dados);
    } catch (e) {
      console.error(e);
      setErro("Erro ao carregar Ordens de Serviço");
    } finally {
      setCarregando(false);
    }
  };

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
                <th>ID</th>
                <th>Descrição</th>
                <th>Data Abertura</th>
                <th>Data Início</th>
                <th>Data Término</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>

            <tbody>
              {ordens.map((o) => (
                <tr key={o.id_ord_serv}>
                  <td>{o.id_ord_serv}</td>
                  <td>{o.descricao}</td>
                  <td>{o.dataAbertura || "-"}</td>
                  <td>{o.dataInicio || "-"}</td>
                  <td>{o.dataTermino || "-"}</td>
                  <td>{o.status}</td>

                  <td className="acoes-coluna-icones">
                    <button
                      onClick={() => handleAceitar(o.id_ord_serv)}
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
                      onClick={() => handleEditar(o.id_ord_serv)}
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
                      onClick={() => handleExcluir(o.id_ord_serv)}
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
