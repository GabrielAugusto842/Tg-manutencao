import React, { useState, useEffect } from "react";
import Layout from "../../componentes/Layout/Layout";
import "../../telas/Equipamento/VisualizarEquipamentos.css";
import { FaCheckCircle, FaEdit, FaTrash } from "react-icons/fa";
import api from "../../Services/api.jsx";
import { useNavigate } from "react-router-dom";

function VisualizarEquipamentosContent() {
  const [equipamentos, setEquipamentos] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState(null);
  const [mensagemSucesso, setMensagemSucesso] = useState(null);
  const navigate = useNavigate();

  const buscarEquipamentos = async () => {
    try {
      setCarregando(true);
      setErro(null);
      setMensagemSucesso(null);

      const response = await api.get("/maquina");
      setEquipamentos(response.data);
    } catch (error) {
      console.error("Erro ao buscar máquinas:", error);
      setErro("Erro ao carregar máquinas do servidor.");
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    buscarEquipamentos();
  }, []);

  const handleDeletar = async (id) => {
    const equipamentoAlvo = equipamentos.find((e) => e.idMaquina === id);

    if (
      !window.confirm(
        `Tem certeza que deseja DELETAR PERMANENTEMENTE a máquina: ${equipamentoAlvo.nome} (Série: ${equipamentoAlvo.numeroSerie})?`
      )
    ) {
      return;
    }

    try {
      setCarregando(true);
      setErro(null);
      setMensagemSucesso(null);

      await api.delete(`/maquina/${id}`);

      setEquipamentos((prev) => prev.filter((e) => e.idMaquina !== id));

      setMensagemSucesso(`Máquina ID ${id} deletada com sucesso!`);
    } catch (error) {
      console.error("Erro ao deletar máquina:", error);
      setErro("Erro ao excluir máquina.");
    } finally {
      setCarregando(false);
    }
  };

  if (carregando) {
    return (
      <div className="container">
        <p>Carregando máquinas...</p>
      </div>
    );
  }

  return (
    <div className="visualizar-equipamentos-page">
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

      {equipamentos.length === 0 ? (
        <p>
          Nenhuma máquina cadastrada. (A lista pode estar vazia devido à
          simulação de exclusão.)
        </p>
      ) : (
        <div className="tabela-wrapper">
          <table className="tabela-equipamentos">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Marca</th>
                <th>Modelo</th>
                <th>Número de Série</th>
                <th>Tag</th>
                <th>Prod. p/ Hora</th>
                <th>Disponib. / Mês</th>
                <th>Setor</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {equipamentos.map((maquina) => (
                <tr key={maquina.idMaquina}>
                  <td>{maquina.nome}</td>
                  <td>{maquina.marca}</td>
                  <td>{maquina.modelo}</td>
                  <td>{maquina.numeroSerie}</td>
                  <td>{maquina.tag}</td>
                  <td>{maquina.producaoHora ?? "---"}</td>
                  <td>{maquina.disponibilidadeMes}</td>
                  <td>{maquina.nomeSetor || maquina.setor}</td>

                  <td className="acoes-coluna-icones">
                    <button
                      className="btn-editar"
                      onClick={() => {
                        if (!maquina.idMaquina) {
                          alert("ID da máquina inválido!");
                          return;
                        }
                        navigate(`/equipamentos/editar/${maquina.idMaquina}`);
                      }}
                      title="Editar Máquina"
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
                      className="btn-deletar"
                      onClick={() => handleDeletar(maquina.id_maquina)}
                      title="Deletar Máquina"
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

export default function VisualizarEquipamentos() {
  return (
    <Layout title="Visualizar Máquinas">
      <VisualizarEquipamentosContent />
    </Layout>
  );
}
