// src/componentes/Relatorios/DashboardMTBF.jsx

import React from "react";
import MtbfComparisonBar from "./MtbfComparisonBar.jsx";

export default function DashboardMTBF({ mtbfValue, valorMeta }) {
  const valorAtual = mtbfValue || 0;

  return <MtbfComparisonBar valorAtual={valorAtual} valorMeta={valorMeta} />;
}
