import React, { useState, useEffect } from "react";
import Layout from "../../componentes/Layout/Layout";
import "../../telas/Setor/VisualizarSetores.css";
import { FaCheckCircle, FaEdit, FaTrash} from "react-icons/fa";
import { useNavigate } from "react-router-dom";


const API_URL = "http://localhost:3002/api/setores";

function VisualizarSetoresContent() {
  const [setores, setSetores] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const [mensagemSucesso, setMensagemSucesso] = useState(null); // Novo estado para feedback
  const navigate = useNavigate();

  // Função para buscar usuários (refatorada para ser reutilizada)
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
      setErro(
        "Não foi possível carregar os setores. Verifique sua conexão ou a API."
      );
      console.error("Erro na busca de setores:", e);
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

  // FUNÇÃO DE DELEÇÃO
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
        // Tenta ler o erro do corpo da resposta, se disponível
        const erroData = await resposta
          .json()
          .catch(() => ({ message: resposta.statusText }));
        throw new Error(
          erroData.error || erroData.message || "Erro desconhecido"
        );
      }

      // Se a operação for bem-sucedida, recarrega a lista para remover o usuário
      await buscarSetores();
      setMensagemSucesso(`Setor ID: ${id} deletado com sucesso!`);
    } catch (e) {
      setErro(`Falha ao deletar setor: ${e.message}`);
      console.error("Erro na operação de deleção:", e);
    } finally {
      setCarregando(false);
    }
  };

  // ----------------------------------------------------
  // LÓGICA DE EXIBIÇÃO DE ESTADO
  // ----------------------------------------------------

  if (carregando) {
    return (
      <div className="container">
        <p>Carregando Setores...</p>
      </div>
    );
  }

  // ----------------------------------------------------
  // RENDERIZAÇÃO DO CONTEÚDO FINAL
  // ----------------------------------------------------
  return (
    <div className="visualizar-setores-page">
      {/* Mensagens de Feedback */}
      {erro && (
        <div
          className="alerta-erro"
          style={{ color: "red", marginBottom: "15px" }}
        >
          {erro}
        </div>
      )}
      {mensagemSucesso && (
        <div
          className="alerta-sucesso"
          style={{ color: "green", marginBottom: "15px" }}
        >
          {mensagemSucesso}
        </div>
      )}

      {setores.length === 0 ? (
        <p>Nenhum setor cadastrado.</p>
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
              {setores.map((setor) => {
                return (
                  <tr key={setor.idSetor}>
                    <td>{setor.nomeSetor}</td>
                    <td>{setor.descricao}</td>

                    <td className="acoes-coluna-icones">
                      <button
                        className="btn-editar"
                        onClick={() => handleEditar(setor.idSetor)}
                        title="Editar Setor"
                        style={{ color: "blue", background: "none", border: "none", cursor: "pointer" }}
                      >
                        <FaEdit size={20} />
                      </button>

                      {/* BOTÃO DE DELETAR MANTIDO */}
                      <button
                        className="btn-deletar"
                        onClick={() => handleDeletar(setor.idSetor)}
                        title="Deletar setor"
                        style={{ color: "red", background: "none", border: "none", cursor: "pointer" }}
                      >
                        <FaTrash size={20} />
                      </button>
                    </td>
                  </tr>
                );
              })}
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
