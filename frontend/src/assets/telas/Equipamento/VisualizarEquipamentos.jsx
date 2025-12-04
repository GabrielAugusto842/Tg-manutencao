import React, { useState, useEffect } from "react";
import Layout from "../../componentes/Layout/Layout";
import "../../telas/Equipamento/VisualizarEquipamentos.css";
import { FaEdit, FaTrash } from "react-icons/fa";
import api from "../../Services/api.jsx";
import { useNavigate } from "react-router-dom";

function VisualizarEquipamentosContent() {
  const [equipamentos, setEquipamentos] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState(null);
  const [mensagemSucesso, setMensagemSucesso] = useState(null);

  const navigate = useNavigate();

  // 🔎 FILTROS
  const [filtroNome, setFiltroNome] = useState("");
  const [filtroSerie, setFiltroSerie] = useState("");
  const [filtroSetor, setFiltroSetor] = useState("");

  // 🔎 Opções de setores
  const [opcoesSetor, setOpcoesSetor] = useState([]);

  useEffect(() => {
    const previousTitle = document.title;

    const filtrosAtivos = [];

    if (filtroNome.trim() !== "") filtrosAtivos.push(`Nome: ${filtroNome}`);
    if (filtroSerie.trim() !== "")
      filtrosAtivos.push(`Nº Série: ${filtroSerie}`);
    if (filtroSetor.trim() !== "") filtrosAtivos.push(`Setor: ${filtroSetor}`);

    if (filtrosAtivos.length === 0) {
      document.title = "Maintenance Manager - Todos os equipamentos";
    } else {
      document.title = `Maintenance Manager - Equipamentos filtrados (${filtrosAtivos.join(
        " | "
      )})`;
    }

    return () => {
      document.title = previousTitle;
    };
  }, [filtroNome, filtroSerie, filtroSetor]);

  const buscarEquipamentos = async () => {
    try {
      setCarregando(true);
      setErro(null);

      const response = await api.get("/maquina");
      setEquipamentos(response.data);
      // eslint-disable-next-line no-unused-vars
    } catch (error) {
      setErro("Erro ao carregar máquinas.");
    } finally {
      setCarregando(false);
    }
  };

  // Carrega SETORES para o SELECT
  const carregarSetores = async () => {
    try {
      const res = await api.get("/setores");
      setOpcoesSetor(
        res.data.map((s) => ({
          id: s.idSetor,
          nome: s.nomeSetor,
        }))
      );
    } catch (error) {
      console.error("Erro ao carregar setores:", error);
    }
  };

  useEffect(() => {
    buscarEquipamentos();
    carregarSetores();
  }, []);

  const handleDeletar = async (id) => {
    const equipamento = equipamentos.find((e) => e.idMaquina === id);

    if (!window.confirm(`Excluir "${equipamento.nome}"?`)) return;

    try {
      await api.delete(`/maquina/${id}`);
      setEquipamentos((prev) => prev.filter((e) => e.idMaquina !== id));
      setMensagemSucesso(`Máquina "${equipamento.nome}" deletada.`);
      // eslint-disable-next-line no-unused-vars
    } catch (error) {
      setErro("Erro ao excluir máquina.");
    }
  };

    // ------------------ //
    // -- EXPORTAR CSV -- //
    // ------------------ //
    
  const exportarCSV = () => {
    // Pega os dados já filtrados, os mesmos da tabela
    const filtrados = equipamentos.filter((m) => {
      return (
        m.nome.toLowerCase().includes(filtroNome.toLowerCase()) &&
        m.numeroSerie.toLowerCase().includes(filtroSerie.toLowerCase()) &&
        (filtroSetor ? m.setor === filtroSetor : true)
      );
    });
    // Cabeçalho
    const header = [
      "nome", 
      "marca",
      "modelo",
      "numero_serie",
      "tag",
      "producao_hora",
      "dispon_mensal",
      "setor"
    ];
    // Linhas
    const linhas = filtrados.map((m) => [
      m.nome,
      m.marca,
      m.modelo,
      m.numeroSerie,
      m.tag,
      m.producaoHora ?? "---",
      m.disponibilidadeMes,
      m.setor
    ]);
    // Monta o CSV
    const csv = [
      header.join(","),
      ...linhas.map((l) => l.join(","))
    ].join("\n");
    // Baixa o arquivo
    const BOM = "\uFEFF";
    const blob = new Blob([BOM + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "relatorio_equipamentos.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  if (carregando) return <p>Carregando máquinas...</p>;

  return (
    <div className="visualizar-equipamentos-page" id="print-area">
        
      {/* ALERTAS */}
      {erro && <div className="alerta-erro">{erro}</div>}
      {mensagemSucesso && (
        <div className="alerta-sucesso">{mensagemSucesso}</div>
      )}

      {/* ===================== */}
      {/* 🔍 ÁREA DE FILTROS   */}
      {/* ===================== */}

      <div className="opcoes-header">
        <div className="filtros-container no-print">
          <input
            type="text"
            placeholder="Buscar por nome..."
            className="filtro-input"
            value={filtroNome}
            onChange={(e) => setFiltroNome(e.target.value)}
          />

          <input
            type="text"
            placeholder="Buscar por Nº de Série..."
            className="filtro-input"
            value={filtroSerie}
            onChange={(e) => setFiltroSerie(e.target.value)}
          />

          <select
            className="filtro-select"
            value={filtroSetor}
            onChange={(e) => setFiltroSetor(e.target.value)}
          >
          <option value="">Setor (Todos)</option>
          {opcoesSetor.map((setor) => (
            <option key={setor.id} value={setor.nome}>
              {setor.nome}
            </option>
            ))}
          </select>
        </div>

        {/*-----------------------------------
         BOTÕES DE EXPORTAÇÃO (PDF + CSV) 
        -----------------------------------*/}
        <div className="export-group no-print">
          <button className="botao-csv" onClick={exportarCSV}>
            🗒️ EXPORTAR CSV
          </button>
          
          <button onClick={() => window.print()} className="botao-pdf">
            📥 EXPORTAR PDF
          </button>
        </div>
      </div>

      
      

      {/* ===================== */}
      {/* 📋 TABELA            */}
      {/* ===================== */}
      <div className="tabela-wrapper">
        <table className="tabela-equipamentos">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Marca</th>
              <th>Modelo</th>
              <th>Nº Série</th>
              <th>Tag</th>
              <th>Prod/Hora</th>
              <th>Dispon/Mês</th>
              <th>Setor</th>
              <th class="no-print">Ações</th>
            </tr>
          </thead>

          <tbody>
            {equipamentos
              .filter((m) => {
                return (
                  m.nome.toLowerCase().includes(filtroNome.toLowerCase()) &&
                  m.numeroSerie
                    .toLowerCase()
                    .includes(filtroSerie.toLowerCase()) &&
                  (filtroSetor ? m.setor === filtroSetor : true)
                );
              })
              .map((maquina) => (
                <tr key={maquina.idMaquina}>
                  <td>{maquina.nome}</td>
                  <td>{maquina.marca}</td>
                  <td>{maquina.modelo}</td>
                  <td>{maquina.numeroSerie}</td>
                  <td>{maquina.tag}</td>
                  <td>{maquina.producaoHora ?? "---"}</td>
                  <td>{maquina.disponibilidadeMes}</td>
                  <td>{maquina.setor}</td>

                  <td className="acoes-coluna-icones no-print">
                    <button
                      className="btn-editar"
                      onClick={() =>
                        navigate(`/equipamentos/editar/${maquina.idMaquina}`)
                      }
                    >
                      <FaEdit size={20} />
                    </button>

                    <button
                      className="btn-deletar"
                      onClick={() => handleDeletar(maquina.idMaquina)}
                    >
                      <FaTrash size={20} />
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
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
