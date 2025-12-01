// src/componentes/Relatorios/DashboardGeral.jsx

import React, { useState } from "react";
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
  // Estado para a Meta MTTR
  const [metaHoras, setMetaHoras] = useState(4);
  const [metaMinutos, setMetaMinutos] = useState(0);

  // Calcula o valor da meta em horas decimais
  const metaMTTR = metaHoras + metaMinutos / 60;

  // Chamada do hook (assumido)
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
        <MttrResumoCard
          dataInicial={dataInicial}
          dataFinal={dataFinal}
          idSetor={idSetor}
          // Passando os props da meta para edição
          metaHoras={metaHoras}
          setMetaHoras={setMetaHoras}
          metaMinutos={metaMinutos}
          setMetaMinutos={setMetaMinutos}
          metaMTTR={metaMTTR}
        />
        <MtbfResumoCard
          dataInicial={dataInicial}
          dataFinal={dataFinal}
          idSetor={idSetor}
        />
        <DisponibilidadeResumoCard
          dataInicial={dataInicial}
          dataFinal={dataFinal}
          idSetor={idSetor}
        />
        <OsConcluidasResumoCard
          dataInicial={dataInicial}
          dataFinal={dataFinal}
          idSetor={idSetor}
        />
        <CustoTotalResumoCard
          dataInicial={dataInicial}
          dataFinal={dataFinal}
          idSetor={idSetor}
        />
        <MttaResumoCard
          dataInicial={dataInicial}
          dataFinal={dataFinal}
          idSetor={idSetor}
        />

        <BacklogIntegradoCard
          backlog={backlog}
          loading={loading}
          error={error}
          chartComponent={null}
        />
      </div>
    </div>
  );
}
