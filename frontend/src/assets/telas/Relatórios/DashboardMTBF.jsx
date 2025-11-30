// src/componentes/Relatorios/DashboardMTBF.jsx

import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { getMtbfColor, MTBF_META_HORAS } from "../../Services/formatters";

export default function DashboardMTBF({ mtbfValue }) {
  // Para fins de visualização simples, usaremos a cor condicional.

  const valorAtual = mtbfValue || 0;
  const corPrincipal = getMtbfColor(valorAtual, MTBF_META_HORAS); // Dados simples para um gráfico de rosca para fins visuais

  const dadosGrafico = [
    { name: "MTBF", value: 1, color: corPrincipal },
    { name: "Placeholder", value: 0.1, color: "#f1f1f1" },
  ];

  return (
   <ResponsiveContainer width="100%" height={120}>
      {" "}
      <PieChart>
        {" "}
        <Pie
          data={dadosGrafico}
          dataKey="value"
          outerRadius={45}
          innerRadius={35}
          isAnimationActive={false}
          startAngle={270}
          endAngle={-90}
        >
          {" "}
          {dadosGrafico.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}{" "}
        </Pie>{" "}
      </PieChart>{" "}
    </ResponsiveContainer>
  );
}
