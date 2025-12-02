import React, { useState } from "react";
import MttrResumoCard from "./MttrResumoCard.jsx";
import MtbfResumoCard from "./MtbfResumoCard.jsx";
import OsConcluidasResumoCard from "./OsConcluidasResumoCard.jsx";
import MttaResumoCard from "./MttaResumoCard.jsx";
import MttrAnualChart from "./MttrAnualChart.jsx";
import MtbfAnualChart from "./MtbfAnualChart.jsx";
import CustoTotalResumoCard from "./CustoTotalResumoCard.jsx";

import "./DashboardGeral.css";
import { useBacklog } from "./backlog";
import BacklogIntegradoCard from "./BacklogIntegrado.jsx";

export default function DashboardGeral({ dataInicial, dataFinal, idSetor }) {
  /* ------------------- META MTTR ------------------- */
  const [metaHoras, setMetaHoras] = useState(4);
  const [metaMinutos, setMetaMinutos] = useState(0);
  const metaMTTR = metaHoras + metaMinutos / 60;

  /* ------------------- META MTBF ------------------- */
  const [metaMtbfHoras, setMetaMtbfHoras] = useState(200);
  const [metaMtbfMinutos, setMetaMtbfMinutos] = useState(0);
  const metaMTBF = metaMtbfHoras + metaMtbfMinutos / 60;


  /* ------------------- META MTTA (NOVA) ------------------- */
  const [metaMttaHoras, setMetaMttaHoras] = useState(0);
  const [metaMttaMinutos, setMetaMttaMinutos] = useState(30);
  const metaMTTA = metaMttaHoras + metaMttaMinutos / 60;

  /* ------------------- BACKLOG ------------------- */
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
        {/* ---------------------- MTTR ---------------------- */}
        <MttrResumoCard
          dataInicial={dataInicial}
          dataFinal={dataFinal}
          idSetor={idSetor}
          metaHoras={metaHoras}
          setMetaHoras={setMetaHoras}
          metaMinutos={metaMinutos}
          setMetaMinutos={setMetaMinutos}
          metaMTTR={metaMTTR}
        />

        {/* ---------------------- MTBF ----------------------- */}
        <MtbfResumoCard
          dataInicial={dataInicial}
          dataFinal={dataFinal}
          idSetor={idSetor}
          metaMtbfHoras={metaMtbfHoras}
          setMetaMtbfHoras={setMetaMtbfHoras}
          metaMtbfMinutos={metaMtbfMinutos}
          setMetaMtbfMinutos={setMetaMtbfMinutos}
          metaMTBF={metaMTBF}
        />

        {/* ---------------------- MTTA (CORRIGIDO) ----------------------- */}
        <MttaResumoCard
          dataInicial={dataInicial}
          dataFinal={dataFinal}
          idSetor={idSetor}
          metaHoras={metaMttaHoras}
          setMetaHoras={setMetaMttaHoras}
          metaMinutos={metaMttaMinutos}
          setMetaMinutos={setMetaMttaMinutos}
          metaMTTA={metaMTTA}
        />

 

        {/* ----------------- CUSTO TOTAL ----------------- */}
        <CustoTotalResumoCard
          dataInicial={dataInicial}
          dataFinal={dataFinal}
          idSetor={idSetor}
        />

      

        {/* ----------------- BACKLOG INTEGRADO ----------------- */}
        <BacklogIntegradoCard
          backlog={backlog}
          loading={loading}
          error={error}
          chartComponent={null}
        />
      </div>

      {/* ----------------- NOVO GRÁFICO ANUAL MTTR ----------------- */}
<div className="dashboard-kpi-grid pula-linha-export full-width-chart">
  <MttrAnualChart 
    idSetor={idSetor} 
  />
</div>

      {/* ----------------- NOVO GRÁFICO ANUAL MTBF ----------------- */}
<div className="dashboard-kpi-grid pula-linha-export full-width-chart">
  <MtbfAnualChart 
    idSetor={idSetor} 
  />
</div>
    </div>
  );
}
