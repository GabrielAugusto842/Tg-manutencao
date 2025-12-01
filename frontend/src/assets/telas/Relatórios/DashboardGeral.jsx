import React, { useState } from "react";
import MttrResumoCard from "./MttrResumoCard.jsx";
import MtbfResumoCard from "./MtbfResumoCard.jsx";
import OsConcluidasResumoCard from "./OsConcluidasResumoCard.jsx";
import DisponibilidadeResumoCard from "./DisponibilidadeResumoCard.jsx";
import MttaResumoCard from "./MttaResumoCard.jsx";
import CustoTotalResumoCard from "./CustoTotalResumoCard.jsx";

import "./DashboardGeral.css";
// NOTE: Mantendo imports assumidos pelo seu contexto
import { useBacklog } from "./backlog";
import BacklogIntegradoCard from "./BacklogIntegrado.jsx";

export default function DashboardGeral({ dataInicial, dataFinal, idSetor }) {
  // Estado para a Meta MTTR (Horas e Minutos)
  const [metaHoras, setMetaHoras] = useState(4);
  const [metaMinutos, setMetaMinutos] = useState(0);
  // Calcula o valor da meta MTTR em horas decimais
  const metaMTTR = metaHoras + metaMinutos / 60;

  // ESTADOS ESSENCIAIS PARA O MTBF (Horas e Minutos)
  const [metaMtbfHoras, setMetaMtbfHoras] = useState(200);
  const [metaMtbfMinutos, setMetaMtbfMinutos] = useState(0);
  // CÁLCULO CORRETO: Minutos convertidos para horas decimais
  const metaMTBF = metaMtbfHoras + metaMtbfMinutos / 60;

  // NOVO ESTADO: Meta para Disponibilidade (%)
  const [metaDisponibilidade, setMetaDisponibilidade] = useState(95.0);

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
          // PASSANDO OS ESTADOS COMPLETOS
          metaMtbfHoras={metaMtbfHoras}
          setMetaMtbfHoras={setMetaMtbfHoras}
          metaMtbfMinutos={metaMtbfMinutos}
          setMetaMtbfMinutos={setMetaMtbfMinutos}
          metaMTBF={metaMTBF}
        />
        <DisponibilidadeResumoCard
          dataInicial={dataInicial}
          dataFinal={dataFinal}
          idSetor={idSetor}
          // PASSANDO AS NOVAS PROPS DE META
          metaDisponibilidade={metaDisponibilidade}
          setMetaDisponibilidade={setMetaDisponibilidade}
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
