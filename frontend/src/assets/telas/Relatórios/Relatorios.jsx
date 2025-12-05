import React, { useState, useEffect } from "react";
import Layout from "../../componentes/Layout/Layout";
import DashboardGeral from "./DashboardGeral.jsx";
import DashboardRanking from "./DashboardRanking.jsx";
import DashboardMaquinas from "./DashboardMaquinas.jsx";
import "./Relatorios.css";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const API_URL = "http://localhost:3002/api/setores";

export default function Relatorios() {
  const [mes, setMes] = useState("");
  const [ano, setAno] = useState("");
  const [tipoRelatorio, setTipoRelatorio] = useState("dashboard-geral");
  const [idSetorSelecionado, setIdSetorSelecionado] = useState("");
  const [setores, setSetores] = useState([]);
  const [carregandoSetores, setCarregandoSetores] = useState(true);

  const anoAtual = new Date().getFullYear();

  // Carrega setores
  useEffect(() => {
    const buscarSetores = async () => {
      try {
        const response = await fetch(API_URL, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        if (!response.ok) throw new Error("Falha ao carregar setores.");
        const data = await response.json();
        setSetores(data);
      } catch (error) {
        console.error("Erro ao buscar setores:", error);
      } finally {
        setCarregandoSetores(false);
      }
    };
    buscarSetores();
  }, []);

  // Função de exportar PDF
  const exportRelatorioPDF = () => {
    const input = document.querySelector(".relatorio-display-area");
    if (!input) return;

    html2canvas(input, { scale: 2, useCORS: true }).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      let heightLeft = pdfHeight;
      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, pdfWidth, pdfHeight);
      heightLeft -= pdf.internal.pageSize.getHeight();

      while (heightLeft > 0) {
        position = heightLeft - pdfHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, pdfWidth, pdfHeight);
        heightLeft -= pdf.internal.pageSize.getHeight();
      }

      pdf.save("relatorio.pdf");
    });
  };

  return (
    <Layout title="Relatórios">
      <div className="relatorios-page-container">
        {/* Header com botão de exportar PDF */}
        <header className="relatorios-header"></header>

        {/* FILTROS */}
        <div className="relatorios-filtros-container">
          {/* Mês */}
          <div className="filtro-grupo">
            <label>Mês</label>
            <select
              value={mes}
              onChange={(e) => setMes(e.target.value)}
              className="filtro-input"
            >
              <option value="">Todos</option>
              {[...Array(12)].map((_, i) => (
                <option key={i + 1} value={i + 1}>
                  {new Date(0, i).toLocaleString("pt-BR", { month: "long" })}
                </option>
              ))}
            </select>
          </div>

          {/* Ano */}
          <div className="filtro-grupo">
            <label>Ano</label>
            <input
              type="number"
              value={ano}
              onChange={(e) => setAno(e.target.value)}
              className="filtro-input"
              placeholder={anoAtual.toString()}
              min="2000"
              max="2100"
            />
          </div>

          {/* Tipo de relatório */}
          <div className="filtro-grupo">
            <label>Tipo de Relatório</label>
            <select
              value={tipoRelatorio}
              onChange={(e) => setTipoRelatorio(e.target.value)}
              className="filtro-input"
            >
              <option value="dashboard-geral">
                Dashboard - Métricas Gerais
              </option>
              <option value="ranking">Ranking de Ordens</option>
              <option value="dashboard-maquinas">Métricas por Máquinas</option>
            </select>
          </div>

          {/* Setor */}
          <div className="filtro-grupo">
            <label>Setor</label>
            <select
              value={idSetorSelecionado}
              onChange={(e) => setIdSetorSelecionado(e.target.value)}
              className="filtro-input"
              disabled={carregandoSetores}
            >
              <option value="">Todos os Setores</option>
              {setores.length > 0 ? (
                setores.map((setor) => (
                  <option key={setor.idSetor} value={setor.idSetor}>
                    {setor.nomeSetor}
                  </option>
                ))
              ) : (
                <option disabled>
                  {carregandoSetores ? "Carregando..." : "Nenhum setor"}
                </option>
              )}
            </select>
          </div>
        </div>

        <main className="relatorio-display-area">
          {tipoRelatorio === "dashboard-geral" && (
            <DashboardGeral
              mes={mes}
              ano={ano}
              idSetor={idSetorSelecionado}
              exportPDF={exportRelatorioPDF} // passamos a função como prop
            />
          )}

          {tipoRelatorio === "ranking" && (
            <DashboardRanking
              mes={mes}
              ano={ano}
              idSetor={idSetorSelecionado}
              exportPDF={exportRelatorioPDF} // passamos a função como prop
            />
          )}

          {tipoRelatorio === "dashboard-maquinas" && (
            <DashboardMaquinas
              mes={mes}
              ano={ano}
              idSetor={idSetorSelecionado}
              exportPDF={exportRelatorioPDF} // passamos a função como prop
            />
          )}
        </main>
      </div>
    </Layout>
  );
}
