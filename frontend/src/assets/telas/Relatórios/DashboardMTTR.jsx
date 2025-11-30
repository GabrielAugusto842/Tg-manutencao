// src/componentes/Relatorios/DashboardMTTR.jsx (NOVA VERSÃO)
import React from "react";
import MttrComparisonBar from "./MttrComparisonBar.jsx"; // Importamos o novo componente
import { MTTR_META_HORAS } from "../../Services/formatters";

export default function DashboardMTTR({ mttrValue }) {
  const valorAtual = mttrValue || 0;

  return (
    <MttrComparisonBar valorAtual={valorAtual} valorMeta={MTTR_META_HORAS} />
  );
}
