import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { formatPercentual } from "../../Services/formatters";

export default function DashboardDisponibilidade({ valor }) {
  const valorAtual = valor ?? 0;

  // Cor condicional: verde >= 95%, amarelo < 95%
  const corPrincipal = valorAtual >= 95 ? "#28a745" : "#ffc107";

  const dadosGrafico = [
    { name: "Disponível", value: valorAtual, color: corPrincipal },
    { name: "Indisponível", value: 100 - valorAtual, color: "#e5e7eb" },
  ];

  return (
    <ResponsiveContainer width="100%" height={150}>
      <PieChart>
        <Pie
          data={dadosGrafico}
          dataKey="value"
          outerRadius={60}
          innerRadius={40}
          startAngle={90}
          endAngle={-270}
          isAnimationActive={false}
        >
          {dadosGrafico.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
          {/* Valor central da rosca */}
          <text
            x="50%"
            y="50%"
            textAnchor="middle"
            dominantBaseline="middle"
            style={{ fontSize: "18px", fontWeight: "700", fill: corPrincipal }}
          >
            {formatPercentual(valorAtual)}
          </text>
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  );
}
