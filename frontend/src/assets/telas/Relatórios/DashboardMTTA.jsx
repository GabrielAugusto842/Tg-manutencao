// src/componentes/Relatorios/DashboardMTTA.jsx

import React from "react";
import MttaComparisonBar from "./MttaComparisonBar.jsx";

export default function DashboardMTTA({ mttaValue, valorMeta }) {
  return <MttaComparisonBar valorAtual={mttaValue || 0} valorMeta={valorMeta} />;
}
