// src/componentes/Relatorios/DashboardMTTR.jsx

import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
// O import agora aponta para o arquivo de utilitários recém-criado
import { getMttrColor, MTTR_META_HORAS } from "../../Services/formatters";

export default function DashboardMTTR({ mttrValue }) {
  // O MTTR deve ser um gráfico que mostra se estamos abaixo (verde) ou acima (vermelho) da meta.
  // Usaremos um gráfico simples de pizza para ilustrar a performance por cor.

  const valorAtual = mttrValue || 0;
  const corPrincipal = getMttrColor(valorAtual, MTTR_META_HORAS); // Dados simples para o gráfico:

  const dadosGrafico = [
    // A cor da fatia reflete a performance MTTR
    { name: "MTTR Atual", value: 1, color: corPrincipal }, // Valor fixo, a cor é o importante // Adiciona um placeholder para preencher o resto do círculo (o valor não é percentual)
    { name: "Placeholder", value: 0.1, color: "#f1f1f1" },
  ];
  return (
    <ResponsiveContainer width="100%" height={120}>
      {" "}
      <PieChart>
        {" "}
        <Pie // Usa o MTTR atual como o único valor de dados significativo
          data={dadosGrafico}
          dataKey="value"
          outerRadius={45}
          innerRadius={35}
          isAnimationActive={false}
          startAngle={270}
          endAngle={-90}
        >
          {" "}
          {/* Itera sobre os dados para definir a cor da fatia */}{" "}
          {dadosGrafico.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}{" "}
        </Pie>{" "}
      </PieChart>{" "}
    </ResponsiveContainer>
  );
}
