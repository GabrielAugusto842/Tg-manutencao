import React from "react";
import MttrResumoCard from "./MttrResumoCard.jsx";
import MtbfResumoCard from "./MtbfResumoCard.jsx";
import OsConcluidasResumoCard from "./OsConcluidasResumoCard.jsx";
import DisponibilidadeResumoCard from "./DisponibilidadeResumoCard.jsx";
import MttaResumoCard from "./MttaResumoCard.jsx";
import CustoTotalResumoCard from "./CustoTotalResumoCard.jsx";

import "./DashboardGeral.css";
import { useBacklog } from "./backlog";
import BacklogIntegradoCard from "./BacklogIntegrado.jsx";

export default function DashboardGeral({ dataInicial, dataFinal, idSetor }) {
  // Chamada do hook
  const { backlog, loading, error } = useBacklog(idSetor);

  return (
    <div className="w-full px-4 py-6" id="print-area">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">
          📊 Relatório Geral de Indicadores
        </h2>

        <button
          onClick={() => window.print()}
          className="no-print botao-pdf-compacto"
        >
          📄📥 Exportar PDF
        </button>
      </div>

      <div className="dashboard-kpi-grid pula-linha-export">
        <MttrResumoCard dataInicial={dataInicial} dataFinal={dataFinal} idSetor={idSetor} />
        <MtbfResumoCard dataInicial={dataInicial} dataFinal={dataFinal} idSetor={idSetor} />
        <DisponibilidadeResumoCard dataInicial={dataInicial} dataFinal={dataFinal} idSetor={idSetor} />
        <OsConcluidasResumoCard dataInicial={dataInicial} dataFinal={dataFinal} idSetor={idSetor} />
        <CustoTotalResumoCard dataInicial={dataInicial} dataFinal={dataFinal} idSetor={idSetor} />
        <MttaResumoCard dataInicial={dataInicial} dataFinal={dataFinal} idSetor={idSetor} />

        {/* 🚀 Backlog Integrado */}
        <BacklogIntegradoCard
          backlog={backlog}
          loading={loading}
          error={error}
          chartComponent={null} // ou componente de gráfico se tiver
        />
      </div>
    </div>
  );
}
