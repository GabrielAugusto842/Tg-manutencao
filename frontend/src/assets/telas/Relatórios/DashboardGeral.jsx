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
