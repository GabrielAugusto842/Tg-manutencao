import React, { useState, useEffect } from "react";
import Layout from "../../componentes/Layout/Layout";
import "../../telas/Setor/VisualizarSetores.css";
import { FaEdit, FaToggleOn, FaToggleOff } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import api from "../../Services/api.jsx";

const API_URL = "http://localhost:3002/api/setores";

function VisualizarSetoresContent() {
  const [setores, setSetores] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const [mensagemSucesso, setMensagemSucesso] = useState(null);
  const [filtroNome, setFiltroNome] = useState(""); // 🔍 NOVO FILTRO
  useEffect(() => {
    const previousTitle = document.title; // salva o título atual (do Layout)
    if (filtroNome.trim() === "") {
      document.title = "Maintenance Manager - Todos os Setores";
    } else {
      document.title = `Maintenance Manager - Setores filtrados: ${filtroNome}`;
    }
    return () => {
      document.title = previousTitle; // restaura quando sair da página
    };
  }, [filtroNome]);

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

  // 🔍 FILTRAGEM
  const setoresFiltrados = setores.filter((s) =>
    s.nomeSetor?.toLowerCase().includes(filtroNome.toLowerCase())
  );

  if (carregando) {
    return <p>Carregando Setores...</p>;
  }

  // ---------------------- //
  // ---- EXPORTAR CSV ---- //
  // ---------------------- //
  const exportarCSV = () => {
    // Usa os mesmos filtros aplicados na tabela
    const filtrados = setores.filter((s) =>
      s.nomeSetor?.toLowerCase().includes(filtroNome.toLowerCase())
    );

    // Cabeçalho CSV
    const header = ["Nome do Setor", "Descrição"];

    // Linhas CSV
    const linhas = filtrados.map((s) => [s.nomeSetor, s.descricao]);

    // Gera o CSV unindo cabeçalho + linhas
    const csv = [header.join(","), ...linhas.map((l) => l.join(","))].join(
      "\n"
    );

    // BOM CORRIGE ACENTOS!!
    const BOM = "\uFEFF";

    const blob = new Blob([BOM + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "relatorio_setores.csv";
    a.click();

    URL.revokeObjectURL(url);
  };

  const handleAlternarStatus = async (setor) => {
    const novoStatus = setor.ativo ? 0 : 1;

    if (
      !window.confirm(
        `Deseja realmente ${novoStatus ? "ATIVAR" : "INATIVAR"} o setor "${
          setor.nomeSetor
        }"?`
      )
    )
      return;

    try {
      await api.put(`/setores/${setor.idSetor}/status`, {
        ativo: novoStatus,
      });

      setSetores((prev) =>
        prev.map((s) =>
          s.idSetor === setor.idSetor ? { ...s, ativo: novoStatus } : s
        )
      );

      setMensagemSucesso(
        `Setor "${setor.nomeSetor}" ${
          novoStatus ? "ativado" : "inativado"
        } com sucesso.`
      );
    } catch (error) {
      setErro("Erro ao atualizar status do setor.");
      console.error(error);
    }
  };

  /* CLASSE CSS PRINT-AREA TUDO Q ESTIVER NO ESCOPO ENTRARÁ PARA O PRINT, MENOS O QUE TIVER A CLASSE NO-PRINT */
  return (
    <div id="print-area">
      <div className="visualizar-setores-page ">
        {/* 🔍 CAMPO DE PESQUISA */}

        <div className="opcoes-header">
          <div className="filtros-container no-print">
            <input
              type="text"
              placeholder="Pesquisar pelo nome do setor..."
              className="input-filtro"
              value={filtroNome}
              onChange={(e) => setFiltroNome(e.target.value)}
            />
          </div>
        </div>
        {erro && <div className="alerta-erro">{erro}</div>}
        {mensagemSucesso && (
          <div className="alerta-sucesso">{mensagemSucesso}</div>
        )}

        <div className="export-group no-print">
          <button className="botao-csv" onClick={exportarCSV}>
            🗒️ EXPORTAR CSV
          </button>
          <button className="botao-pdf" onClick={() => window.print()}>
            📥 EXPORTAR PDF
          </button>
        </div>
      </div>

      {setoresFiltrados.length === 0 ? (
        <p>Nenhum setor encontrado.</p>
      ) : (
        <div className="tabela-wrapper">
          <table className="tabela-setores">
            <thead>
              <tr>
                <th>Nome do Setor</th>
                <th>Descrição</th>
                <th className="no-print">Ações</th>
              </tr>
            </thead>

            <tbody>
              {setoresFiltrados.map((setor) => (
                <tr key={setor.idSetor}>
                  <td>{setor.nomeSetor}</td>
                  <td>{setor.descricao}</td>
                  <td className="acoes-coluna-icones no-print">
                    <button
                      className="btn-editar"
                      onClick={() => handleEditar(setor.idSetor)}
                      title="Editar Setor"
                    >
                      <FaEdit size={20} />
                    </button>

                    <button
                      className={setor.ativo ? "btn-inativar" : "btn-ativar"}
                      onClick={() => handleAlternarStatus(setor)}
                      title={setor.ativo ? "Inativar Setor" : "Ativar Setor"}
                    >
                      {setor.ativo ? (
                        <FaToggleOff size={22} />
                      ) : (
                        <FaToggleOn size={22} />
                      )}
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
