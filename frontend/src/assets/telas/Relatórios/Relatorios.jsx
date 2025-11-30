import React, { useState } from "react";
import Layout from "../../componentes/Layout/Layout";
import DashboardGeral from "./DashboardGeral.jsx";
import "./Relatorios.css";

export default function Relatorios() {
  const [dataInicial, setDataInicial] = useState("");
  const [dataFinal, setDataFinal] = useState("");

  return (
    <Layout title="Relatórios">
      <div className="relatorios-page-container">
        <header className="relatorios-header">

          <div className="relatorios-actions">
            {/* futuros botões: exportar, filtros salvos, etc. */}
          </div>
        </header>

        <div className="relatorios-filtros-container">
          <div className="filtro-grupo">
            <label>Data Inicial</label>
            <input
              type="date"
              value={dataInicial}
              onChange={(e) => setDataInicial(e.target.value)}
              className="filtro-input"
            />
          </div>

          <div className="filtro-grupo">
            <label>Data Final</label>
            <input
              type="date"
              value={dataFinal}
              onChange={(e) => setDataFinal(e.target.value)}
              className="filtro-input"
            />
          </div>
        </div>

        <main className="relatorio-display-area">
          <DashboardGeral dataInicial={dataInicial} dataFinal={dataFinal} />
        </main>
      </div>
    </Layout>
  );
}
