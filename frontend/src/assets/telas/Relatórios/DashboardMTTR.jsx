// src/componentes/Relatorios/DashboardMTTR.jsx

import React from "react";
import MttrComparisonBar from "./MttrComparisonBar.jsx";

// 🛑 RECEBE valorMeta DO CARD PAI
export default function DashboardMTTR({ mttrValue, valorMeta }) {
  const valorAtual = mttrValue || 0; // 🛑 PASSA valorMeta PARA O COMPONENTE DE BARRA

  return <MttrComparisonBar valorAtual={valorAtual} valorMeta={valorMeta} />;
}
