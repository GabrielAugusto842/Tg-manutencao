import React, { useState, useEffect } from "react";
import Layout from "../../componentes/Layout/Layout";
import "../../telas/Setor/VisualizarSetores.css";
import { FaCheckCircle, FaEdit, FaTrash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const API_URL = "http://localhost:3002/api/setores";

function VisualizarSetoresContent() {
  const [setores, setSetores] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const [mensagemSucesso, setMensagemSucesso] = useState(null);
  const [filtroNome, setFiltroNome] = useState(""); // 🔍 NOVO FILTRO
  const navigate = useNavigate();

  const buscarSetores = async () => {
    try {
      setCarregando(true);
      setErro(null);
      setMensagemSucesso(null);

      const resposta = await fetch(API_URL, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!resposta.ok) {
        throw new Error(`Erro ao buscar dados: ${resposta.statusText}`);
      }

      const dados = await resposta.json();
      setSetores(dados);
    } catch (e) {
      setErro("Não foi possível carregar os setores.");
      console.error(e);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    buscarSetores();
  }, []);

  const handleEditar = (id) => {
    navigate(`/setores/editar/${id}`);
  };

  const handleDeletar = async (id) => {
    const setorAlvo = setores.find((s) => s.id_setor === id);

    if (
      !window.confirm(
        `Tem certeza que deseja DELETAR PERMANENTEMENTE o setor: ${setorAlvo.setor}?`
      )
    ) {
      return;
    }

    try {
      setCarregando(true);
      setErro(null);
      setMensagemSucesso(null);

      const resposta = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!resposta.ok) {
        const erroData = await resposta
          .json()
          .catch(() => ({ message: resposta.statusText }));
        throw new Error(
          erroData.error || erroData.message || "Erro desconhecido"
        );
      }

      await buscarSetores();
      setMensagemSucesso(`Setor ID: ${id} deletado com sucesso!`);
    } catch (e) {
      setErro(`Falha ao deletar setor: ${e.message}`);
      console.error(e);
    } finally {
      setCarregando(false);
    }
  };

  // 🔍 FILTRAGEM
  const setoresFiltrados = setores.filter((s) =>
    s.nomeSetor?.toLowerCase().includes(filtroNome.toLowerCase())
  );

  if (carregando) {
    return <p>Carregando Setores...</p>;
  }

  return (
    <div className="visualizar-setores-page">
      {/* 🔍 CAMPO DE PESQUISA */}
      <div className="filtros-container">
        <input
          type="text"
          placeholder="Pesquisar pelo nome do setor..."
          className="input-filtro"
          value={filtroNome}
          onChange={(e) => setFiltroNome(e.target.value)}
        />
      </div>

      {erro && <div className="alerta-erro">{erro}</div>}
      {mensagemSucesso && (
        <div className="alerta-sucesso">{mensagemSucesso}</div>
      )}

      {setoresFiltrados.length === 0 ? (
        <p>Nenhum setor encontrado.</p>
      ) : (
        <div className="tabela-wrapper">
          <table className="tabela-setores">
            <thead>
              <tr>
                <th>Nome do Setor</th>
                <th>Descrição</th>
                <th>Ações</th>
              </tr>
            </thead>

            <tbody>
              {setoresFiltrados.map((setor) => (
                <tr key={setor.idSetor}>
                  <td>{setor.nomeSetor}</td>
                  <td>{setor.descricao}</td>
                  <td className="acoes-coluna-icones">
                    <button
                      className="btn-editar"
                      onClick={() => handleEditar(setor.idSetor)}
                      title="Editar Setor"
                    >
                      <FaEdit size={20} />
                    </button>

                    <button
                      className="btn-deletar"
                      onClick={() => handleDeletar(setor.idSetor)}
                      title="Deletar Setor"
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

export default function VisualizarSetores() {
  return (
    <Layout title="Visualizar Setores">
      <VisualizarSetoresContent />
    </Layout>
  );
}
