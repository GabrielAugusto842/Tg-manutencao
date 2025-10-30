import React, { useState, useEffect } from "react";
import Layout from "../../componentes/Layout/Layout";
import "../../telas/Ordens/VisualizarOrdens.css";
import { FaCheckCircle, FaEdit, FaTrash } from "react-icons/fa";

const ordensFAKE = [
  {
    id_ordem: 1,
    descricao: "Ajuste da bomda hidraulica",
    data_inicio: "2023-10-01T10:00:00",
    data_termino: "2023-10-01T12:00:00",
    custo: 150.0,
    id_usuario: 4,
    id_estado: 500,
    id_maquina: 1,
  },
];

function VisualizarOrdensContent() {
  const [ordem, setOrdem] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState(null);
  const [mensagemSucesso, setMensagemSucesso] = useState(null);

  const buscarOrdensSimulada = () => {
    setCarregando(true);
    setErro(null);
    setMensagemSucesso(null);
    // Simula o tempo de rede

    setTimeout(() => {
      setOrdem([...ordensFAKE]);
      setCarregando(false);
    }, 500);
  };

  useEffect(() => {
    buscarOrdensSimulada();
  }, []);

  const handleAceitar = (id) => {
    alert(`Aceitar ordem ${id}`);
  };

  const handleEditar = (id) => {
    const ordemAlvo = ordem.find((e) => e.id_ordem === id) || {
      descricao: "Ordem",
      custo: "N/A",
    };

    alert(`Editar: ${ordemAlvo.descricao} (${ordemAlvo.custo})`);
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

      {ordem.length === 0 ? (
        <p>
          Nenhuma Ordem cadastrada. (A lista pode estar vazia devido à simulação
          de exclusão.)
        </p>
      ) : (
        <div className="tabela-wrapper">
          <table className="tabela-ordens">
            <thead>
              <tr>
                <th>id_ordem</th>
                <th>Descricao</th>
                <th>data_inicio</th>
                <th>data_termino</th>
                <th>custo</th>
                <th>id_usuario</th>
                <th>id_estado</th>
                <th>id_maquina</th>
                <th>acoes</th>
              </tr>
            </thead>
            <tbody>
              {ordem.map((ordem) => (
                <tr key={ordem.id_maquina}>
                  <td>{ordem.id_ordem}</td>
                  <td>{ordem.descricao}</td>
                  <td>{ordem.data_inicio}</td>
                  <td>{ordem.data_termino}</td>
                  <td>{ordem.custo}</td>
                  <td>{ordem.id_usuario}</td>
                  <td>{ordem.id_estado}</td>
                  <td>{ordem.id_maquina}</td>

                  <td className="acoes-coluna-icones">
                    <button
                      className="btn-aceitar"
                      onClick={() => handleAceitar(ordem.id_ordem)}
                      title="Aceitar"
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
                      className="btn-editar"
                      onClick={() => handleEditar(ordem.id_ordem)}
                      title="Editar"
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
                      className="btn-excluir"
                      onClick={() => handleExcluir(ordem.id_ordem)}
                      title="Excluir"
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

export default function VisualizarOrdens() {
  return (
    <Layout title="Minhas Ordens de Serviço">
      <VisualizarOrdensContent />
    </Layout>
  );
}
