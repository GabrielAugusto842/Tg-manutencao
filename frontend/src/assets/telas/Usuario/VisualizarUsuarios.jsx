import React, { useState, useEffect } from "react";
import Layout from "../../componentes/Layout/Layout";
import "../../telas/Usuario/VisualizarUsuarios.css";
import { FaCheckCircle, FaEdit, FaTrash } from "react-icons/fa";

const API_URL = "http://localhost:3002/api/user";

function VisualizarUsuariosContent() {
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
    const usuarioAlvo = usuarios.find((u) => u.id === id);
    // Implementar a lógica de navegação para a tela de edição aqui, por exemplo:
    // history.push(`/usuarios/editar/${id}`);

    console.log(`Função de Edição chamada para o usuário ID: ${id}.`);
    alert(`Abrindo tela de edição para ${usuarioAlvo.nome}...`);

    // Se você não for usar a navegação do React Router, substitua o alert pela sua lógica.
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

      const resposta = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
      });

      if (!resposta.ok) {
        // Tenta ler o erro do corpo da resposta, se disponível
        const erroData = await resposta
          .json()
          .catch(() => ({ message: resposta.statusText }));
        throw new Error(`Erro ao deletar usuário: ${erroData.message}`);
      }

      // Se a operação for bem-sucedida, recarrega a lista para remover o usuário
      await buscarUsuarios();
      setMensagemSucesso(`Usuário ID: ${id} deletado com sucesso!`);
    } catch (e) {
      setErro(`Falha ao deletar usuário: ${e.message}`);
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
                        style={{
                          color: "blue",
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                        }}
                      >
                        <FaEdit size={20} />
                      </button>

                      {/* BOTÃO DE DELETAR MANTIDO */}
                      <button
                        className="btn-deletar"
                        onClick={() => handleDeletar(usuario.id_usuario)}
                        title="Deletar Usuário"
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
  return (
    <Layout title="Visualizar Usuários">
      <VisualizarUsuariosContent />
    </Layout>
  );
}
