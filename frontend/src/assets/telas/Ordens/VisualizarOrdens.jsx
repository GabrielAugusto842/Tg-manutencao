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

function VisualizarOrdensContent({ user }) {

  const [ordem, setOrdem] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState(null);
  const [mensagemSucesso, setMensagemSucesso] = useState(null);

  const podeAceitar =
    user?.cargo === "Manutentor" || user?.cargo === "Gerente de Manutenção";
  const podeEditar = user?.cargo === "Gerente de Manutenção";
  const podeExcluir = user?.cargo === "Gerente de Manutenção";

   useEffect(() => {
    if (!user) return; // só busca ordens quando o user estiver disponível

    setCarregando(true);
    setErro(null);
    setMensagemSucesso(null);

    setTimeout(() => {
      setOrdem([...ordensFAKE]);
      setCarregando(false);
    }, 500);
  }, [user]);

  // Ações de exemplo
  const handleAceitar = (id) => {
    alert(`Ordem ${id} aceita!`);
  };

  const handleEditar = (id) => {
    alert(`Editar ordem ${id}`);
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
                    {podeAceitar && (
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
                    )}

                    {podeEditar && (
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
                    )}

                    {podeExcluir && (
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

export default function VisualizarOrdens() {
  return (
    <Layout title="Visualizar Ordens de Serviço">
      <VisualizarOrdensContent />
    </Layout>
  );
}

