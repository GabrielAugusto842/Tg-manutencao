import React, { useState, useEffect } from "react";
import Layout from "../../componentes/Layout/Layout";
import "../../telas/Equipamento/VisualizarEquipamentos.css";
import { FaCheckCircle, FaEdit, FaTrash } from "react-icons/fa";

const equipamantosFAKE = [
  {
    id_maquina: 1,
    nome: "laptop",
    marca: "asus",
    modelo: "X515J",
    numero_serie: "N1U2M3E4R506",
    tag: "123a",
    producaoPorHora: 500,
    id_setor: 1,
  },
  {
    id_maquina: 2,
    nome: "Desktop",
    marca: "Dell",
    modelo: "OptiPlex 3000",
    numero_serie: "XYZ998877",
    tag: "456b",
    producaoPorHora: 120,
    id_setor: 2,
  },
  {
    id_maquina: 3,
    nome: "Impressora",
    marca: "HP",
    modelo: "LaserJet Pro",
    numero_serie: "PRT112233",
    tag: "789c",
    producaoPorHora: 800,
    id_setor: 1,
  },
];

function VisualizarEquipamentosContent() {
  const [equipamentos, setEquipamentos] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState(null);
  const [mensagemSucesso, setMensagemSucesso] = useState(null);

  const buscarEquipamentosSimulada = () => {
    setCarregando(true);
    setErro(null);
    setMensagemSucesso(null);
    // Simula o tempo de rede

    setTimeout(() => {
      setEquipamentos([...equipamantosFAKE]); // Re-seta os dados mock (útil após deleção)
      setCarregando(false);
    }, 500);
  };

  useEffect(() => {
    buscarEquipamentosSimulada();
  }, []);

  const handleEditar = (id) => {
    const equipamentoAlvo = equipamentos.find((e) => e.id_maquina === id) || {
      nome: "Máquina",
      modelo: "N/A",
    };

    console.log(`Função de Edição chamada para a máquina ID: ${id}.`);
    alert(
      `Implementar navegação para edição da máquina: ${equipamentoAlvo.nome} (${equipamentoAlvo.modelo})...`
    );
  };

  const handleDeletar = (id) => {
    const equipamentoAlvo = equipamentos.find((e) => e.id_maquina === id);

    if (
      !window.confirm(
        `Tem certeza que deseja DELETAR PERMANENTEMENTE a máquina: ${equipamentoAlvo.nome} (Série: ${equipamentoAlvo.numero_serie})?`
      )
    ) {
      return;
    }

    // --- INÍCIO DA SIMULAÇÃO DE DELEÇÃO ---
    setCarregando(true);
    setErro(null);
    setMensagemSucesso(null);

    // Simulação de sucesso após um pequeno delay
    setTimeout(() => {
      const novaLista = equipamentos.filter((e) => e.id_maquina !== id);
      setEquipamentos(novaLista); // Atualiza o estado para remover visualmente
      setMensagemSucesso(`Máquina ID: ${id} deletada (simulado) com sucesso!`);
      setCarregando(false);
    }, 800); // 800ms de delay para simular a requisição
    // --- FIM DA SIMULAÇÃO DE DELEÇÃO ---
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
                <th>ID Setor</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {equipamentos.map((maquina) => (
                <tr key={maquina.id_maquina}>
                  <td>{maquina.nome}</td>
                  <td>{maquina.marca}</td>
                  <td>{maquina.modelo}</td>
                  <td>{maquina.numero_serie}</td>
                  <td>{maquina.tag}</td>
                  <td>{maquina.producaoPorHora}</td>
                  <td>{maquina.id_setor}</td>

                  <td className="acoes-coluna-icones">
                    <button
                      className="btn-editar"
                      onClick={() => handleEditar(maquina.id_maquina)}
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
