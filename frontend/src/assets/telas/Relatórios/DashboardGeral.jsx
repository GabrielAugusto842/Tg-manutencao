import React, { useState } from "react";
import MttrResumoCard from "./MttrResumoCard.jsx";
import MtbfResumoCard from "./MtbfResumoCard.jsx";
import MttaResumoCard from "./MttaResumoCard.jsx";
import CustoTotalResumoCard from "./CustoTotalResumoCard.jsx";
import MttrAnualChart from "./MttrAnualChart.jsx";
import MtbfAnualChart from "./MtbfAnualChart.jsx";
import MttaAnualChart from "./MttaAnualChart.jsx";
import BacklogIntegradoCard from "./BacklogIntegrado.jsx";
import { useBacklog } from "./backlog";
import { exportToCSV } from "../../Services/csvExport.jsx";
import { formatHoras } from "../../Services/formatters";
import "./DashboardGeral.css";

export default function DashboardGeral({ mes, ano, idSetor, exportPDF }) {
  const [dadosIndicadores, setDadosIndicadores] = useState([]);

  /* ------------------- METAS ------------------- */
  const [metaHoras, setMetaHoras] = useState(4);
  const [metaMinutos, setMetaMinutos] = useState(0);
  const metaMTTR = metaHoras + metaMinutos / 60;

  const [metaMtbfHoras, setMetaMtbfHoras] = useState(200);
  const [metaMtbfMinutos, setMetaMtbfMinutos] = useState(0);
  const metaMTBF = metaMtbfHoras + metaMtbfMinutos / 60;

  const [metaMttaHoras, setMetaMttaHoras] = useState(0);
  const [metaMttaMinutos, setMetaMttaMinutos] = useState(30);
  const metaMTTA = metaMttaHoras + metaMttaMinutos / 60;

  /* ------------------- BACKLOG ------------------- */
  const { backlog, loading, error } = useBacklog(idSetor);

  const handleDataFetched = (novoDado) => {
    setDadosIndicadores((prev) => {
      const outros = prev.filter((d) => d.indicador !== novoDado.indicador);
      return [...outros, novoDado];
    });
  };

  const exportCSV = () => {
    const mttr = dadosIndicadores.find((d) => d.indicador === "MTTR") || {};
    const mtbf = dadosIndicadores.find((d) => d.indicador === "MTBF") || {};
    const mtta = dadosIndicadores.find((d) => d.indicador === "MTTA") || {};
    const custo =
      dadosIndicadores.find((d) => d.indicador === "Custo Total") || {};

    const row = {
      Mes: mes || "Todos",
      Ano: ano || "Todos",
      Setor: idSetor || "Todos",

      MTTR: mttr.valor !== null ? formatHoras(mttr.valor) : "",
      "MTTR Meta": mttr.meta !== undefined ? formatHoras(mttr.meta) : "",
      "MTTR Aviso": mttr.aviso || "",

      MTBF: mtbf.valor !== null ? formatHoras(mtbf.valor) : "",
      "MTBF Meta": mtbf.meta !== undefined ? formatHoras(mtbf.meta) : "",
      "MTBF Aviso": mtbf.aviso || "",

      MTTA: mtta.valor !== null ? formatHoras(mtta.valor) : "",
      "MTTA Meta": mtta.meta !== undefined ? formatHoras(mtta.meta) : "",
      "MTTA Aviso": mtta.aviso || "",

      "Custo Total":
        custo.valor !== null
          ? custo.valor.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })
          : "",
      "Custo Meta":
        custo.meta !== undefined
          ? custo.meta.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })
          : "",
      "Custo Aviso": custo.aviso || "",
    };

    exportToCSV("indicadores_completo.csv", [row]);
  };

  return (
    <div className="w-full px-4 py-6" id="print-area">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">
          📊 Relatório Geral de Indicadores
        </h2>
        <button onClick={exportCSV} className="botao-exportar-geral">
          📥 Exportar CSV
        </button>
      </div>

      {/* Botão PDF */}
      <div className="mb-6">
        <button onClick={exportPDF} className="botao-pdf-relatorio">
          📄 Exportar PDF
        </button>
      </div>

      <div className="dashboard-kpi-grid pula-linha-export">
        {/* MTTR */}
        <MttrResumoCard
          mes={mes}
          ano={ano}
          idSetor={idSetor}
          metaHoras={metaHoras}
          setMetaHoras={setMetaHoras}
          metaMinutos={metaMinutos}
          setMetaMinutos={setMetaMinutos}
          metaMTTR={metaMTTR}
          onDataFetched={handleDataFetched}
        />

        {/* MTBF */}
        <MtbfResumoCard
          mes={mes}
          ano={ano}
          idSetor={idSetor}
          metaMtbfHoras={metaMtbfHoras}
          setMetaMtbfHoras={setMetaMtbfHoras}
          metaMtbfMinutos={metaMtbfMinutos}
          setMetaMtbfMinutos={setMetaMtbfMinutos}
          metaMTBF={metaMTBF}
          onDataFetched={handleDataFetched}
        />

        {/* MTTA */}
        <MttaResumoCard
          mes={mes}
          ano={ano}
          idSetor={idSetor}
          metaHoras={metaMttaHoras}
          setMetaHoras={setMetaMttaHoras}
          metaMinutos={metaMttaMinutos}
          setMetaMinutos={setMetaMttaMinutos}
          metaMTTA={metaMTTA}
          onDataFetched={handleDataFetched}
        />

        {/* CUSTO TOTAL */}
        <CustoTotalResumoCard
          mes={mes}
          ano={ano}
          idSetor={idSetor}
          onDataFetched={handleDataFetched}
        />

        {/* BACKLOG */}
        <BacklogIntegradoCard
          backlog={backlog}
          loading={loading}
          error={error}
          chartComponent={null}
        />
      </div>

      {/* GRÁFICOS ANUAIS */}
      <div className="dashboard-kpi-grid pula-linha-export full-width-chart">
        <MttrAnualChart idSetor={idSetor} />
      </div>
      <div className="dashboard-kpi-grid pula-linha-export full-width-chart">
        <MtbfAnualChart idSetor={idSetor} />
      </div>
      <div className="dashboard-kpi-grid pula-linha-export full-width-chart">
        <MttaAnualChart idSetor={idSetor} />
      </div>
    </div>
  );
}
