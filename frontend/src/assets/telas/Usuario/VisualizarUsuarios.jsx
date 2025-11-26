import React, { useState, useEffect } from "react";
import Layout from "../../componentes/Layout/Layout";
import "../../telas/Usuario/VisualizarUsuarios.css";
import { FaCheckCircle, FaEdit, FaTrash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const API_URL = "http://localhost:3002/api/user";

function VisualizarUsuariosContent({ navigate }) {
  const [usuarios, setUsuarios] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const [mensagemSucesso, setMensagemSucesso] = useState(null); // Novo estado para feedback

  // Função para buscar usuários (refatorada para ser reutilizada)
  const buscarUsuarios = async () => {
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
      setUsuarios(dados);
    } catch (e) {
      setErro(
        "Não foi possível carregar os usuários. Verifique sua conexão ou a API."
      );
      console.error("Erro na busca de usuários:", e);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    buscarUsuarios();
  }, []);

  const handleEditar = (id) => {
    const usuarioAlvo = usuarios.find((u) => u.id_usuario === id);

    navigate(`/usuario/editar/${id}`);
    console.log(`Função de Edição chamada para o usuário ID: ${id}.`);

    alert(`Abrindo tela de edição para ${usuarioAlvo.nome}...`);
  };

  // FUNÇÃO DE DELEÇÃO
  const handleDeletar = async (id) => {
    const usuarioAlvo = usuarios.find((u) => u.id_usuario === id);

    if (
      !window.confirm(
        `Tem certeza que deseja DELETAR PERMANENTEMENTE o usuário: ${usuarioAlvo.nome}?`
      )
    ) {
      return;
    }

    try {
      setCarregando(true);
      setErro(null);
      setMensagemSucesso(null);

      const resposta = await fetch(`${API_URL}/id/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!resposta.ok) {
        const erroData = await resposta.json().catch(() => ({}));
        const msg = erroData.message || erroData.error || resposta.statusText;
        throw new Error(`Erro ao deletar usuário: ${msg}`);
      }

      // Atualiza a lista local sem precisar recarregar da API
      setUsuarios((prev) => prev.filter((u) => u.id_usuario !== id));

      setMensagemSucesso(`Usuário "${usuarioAlvo.nome}" deletado com sucesso!`);
    } catch (e) {
      setErro(e.message);
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
        <p>Carregando usuários...</p>
      </div>
    );
  }

  // ----------------------------------------------------
  // RENDERIZAÇÃO DO CONTEÚDO FINAL
  // ----------------------------------------------------
  return (
    <div className="visualizar-usuarios-page">
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

      {usuarios.length === 0 ? (
        <p>Nenhum usuário cadastrado.</p>
      ) : (
        <div className="tabela-wrapper">
          <table className="tabela-usuarios">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Email</th>
                <th>cargo</th>
                <th>setor</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map((usuario) => {
                return (
                  <tr key={usuario.id_usuario}>
                    <td>{usuario.nome}</td>
                    <td>{usuario.email}</td>
                    <td>{usuario.cargo}</td>
                    <td>{usuario.setor}</td>

                    <td className="acoes-coluna-icones">
                      <button
                        className="btn-editar"
                        onClick={() => handleEditar(usuario.id_usuario)}
                        title="Editar Usuário"
                       
                      >
                        <FaEdit size={20} />
                      </button>

                      {/* BOTÃO DE DELETAR MANTIDO */}
                      <button
                        className="btn-deletar"
                        onClick={() => handleDeletar(usuario.id_usuario)}
                        title="Deletar Usuário"
                       
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

export default function VisualizarUsuarios() {
  const navigate = useNavigate();

  return (
    <Layout title="Visualizar Usuários">
      <VisualizarUsuariosContent navigate={navigate} />
    </Layout>
  );
}
