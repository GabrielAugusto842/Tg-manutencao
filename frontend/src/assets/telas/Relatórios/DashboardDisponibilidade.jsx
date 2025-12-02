import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
// Removido: import { formatPercentual } from "../../Services/formatters";

// Função de formatação local para tornar o componente autocontido
const formatPercentual = (value) => {
  if (typeof value !== "number" || isNaN(value)) return "0.00%";
  return `${value.toFixed(2)}%`;
};

// Removendo o valor padrão do argumento para definir a lógica de fallback no corpo
export default function DashboardDisponibilidade({ valor, meta }) {
  // Garante que o valor da meta é um número válido. Se não for, usa 95.0.
  // Isso torna a verificação da prop 'meta' mais robusta.
  const metaLimite = typeof meta === "number" && !isNaN(meta) ? meta : 95.0;

  const valorAtual = valor ?? 0;

  // Cor condicional: agora usa a metaLimite para comparação.
  // A corPrincipal será recalculada sempre que 'meta' (prop) ou 'valor' (prop) mudar.
  const corPrincipal = valorAtual >= metaLimite ? "#28a745" : "#ffc107";

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
