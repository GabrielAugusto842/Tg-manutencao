// src/componentes/Relatorios/DashboardGeral.jsx (AJUSTADO)

import React from "react";
import MttrResumoCard from "./MttrResumoCard.jsx";
import MtbfResumoCard from "./MtbfResumoCard.jsx";
import OsConcluidasResumoCard from "./OsConcluidasResumoCard.jsx";
import DisponibilidadeResumoCard from "./DisponibilidadeResumoCard.jsx";
import "./DashboardGeral.css";

// 🎯 1. RECEBE idSetor NAS PROPS
export default function DashboardGeral({ dataInicial, dataFinal, idSetor }) {
  return (
<<<<<<< HEAD
    <div className="w-full px-4 py-6">
      {" "}
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">
        📊 Relatório Geral de Indicadores{" "}
      </h2>
      {/* GRID responsivo moderno */}{" "}
      <div className="dashboard-kpi-grid">
        {/* 🎯 2. PASSA idSetor PARA TODOS OS CARDS */}{" "}
        <MttrResumoCard
          dataInicial={dataInicial}
          dataFinal={dataFinal}
          idSetor={idSetor}
        />{" "}
        <MtbfResumoCard
          dataInicial={dataInicial}
          dataFinal={dataFinal}
          idSetor={idSetor}
        />{" "}
=======
    <div className="w-full px-4 py-6" id="print-area">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-gray-8s00">
          📊 Relatório Geral de Indicadores
        </h2>
        <br/>

        <button onClick={() => window.print()}className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg shadow transition no-print">
            📄📥 Exportar PDF
        </button>
        <br class="no-print"/><br class="no-print"/><br class="no-print"/>
      </div>

      {/* GRID responsivo moderno */}
      <div className="dashboard-kpi-grid pula-linha-export">
        <MttrResumoCard dataInicial={dataInicial} dataFinal={dataFinal} />
        <MtbfResumoCard dataInicial={dataInicial} dataFinal={dataFinal} />
>>>>>>> b378518c829127f85a231d882e8afd4a754bf2c2
        <DisponibilidadeResumoCard
          dataInicial={dataInicial}
          dataFinal={dataFinal}
          idSetor={idSetor}
        />{" "}
        <OsConcluidasResumoCard
          dataInicial={dataInicial}
          dataFinal={dataFinal}
          idSetor={idSetor}
        />{" "}
      </div>{" "}
    </div>
  );
}
