// src/componentes/Relatorios/DashboardGeral.jsx

import React from "react";
import MttrResumoCard from "./MttrResumoCard.jsx";
import MtbfResumoCard from "./MtbfResumoCard.jsx";
import OsConcluidasResumoCard from "./OsConcluidasResumoCard.jsx";
import DisponibilidadeResumoCard from "./DisponibilidadeResumoCard.jsx";
import "./DashboardGeral.css";

export default function DashboardGeral({ dataInicial, dataFinal }) {
  return (
    <div className="w-full px-4 py-6">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">
        📊 Relatório Geral de Indicadores
      </h2>

      {/* GRID responsivo moderno */}
      <div className="dashboard-kpi-grid">
        <MttrResumoCard dataInicial={dataInicial} dataFinal={dataFinal} />
        <MtbfResumoCard dataInicial={dataInicial} dataFinal={dataFinal} />
        <DisponibilidadeResumoCard
          dataInicial={dataInicial}
          dataFinal={dataFinal}
        />
        <OsConcluidasResumoCard
          dataInicial={dataInicial}
          dataFinal={dataFinal}
        />
      </div>
    </div>
  );
}
