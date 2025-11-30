// src/componentes/Relatorios/MttrComparisonBar.jsx
import React from "react";
import { formatHoras, getMttrColor } from "../../Services/formatters";

// Valor máximo da escala fixa (pode ser ajustado conforme necessidade)
const MAX_LIMIT = 24; // 24 horas como exemplo, você pode colocar outro valor

export default function MttrComparisonBar({ valorAtual, valorMeta }) {
  // Calcula largura percentual das barras em relação ao limite fixo
  const larguraAtual = Math.min((valorAtual / MAX_LIMIT) * 100, 100);
  const larguraMeta = Math.min((valorMeta / MAX_LIMIT) * 100, 100);

  // Define cores
  const corAtual = getMttrColor(valorAtual, valorMeta); // Vermelho se estiver fora da meta
  const corMeta = "#10b981"; // Verde fixo para meta

  return (
    <div style={{ marginTop: "15px", padding: "0 5px" }}>
      {/* Barra do valor atual */}
      <div
        style={{
          fontSize: "0.9rem",
          fontWeight: "600",
          color: corAtual,
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "4px",
        }}
      >
        <span>MTTR Atual:</span>
        <span>{formatHoras(valorAtual)}</span>
      </div>

      <div
        style={{
          backgroundColor: "#e5e7eb",
          borderRadius: "4px",
          height: "12px",
          marginBottom: "10px",
          width: "100%",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${larguraAtual}%`,
            height: "100%",
            backgroundColor: corAtual,
            transition: "width 0.5s ease",
          }}
        ></div>
      </div>

      {/* Barra da meta */}
      <div
        style={{
          fontSize: "0.8rem",
          fontWeight: "600",
          color: corMeta,
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "4px",
        }}
      >
        <span>MTTR Meta:</span>
        <span>{formatHoras(valorMeta)}</span>
      </div>

      <div
        style={{
          backgroundColor: "#e5e7eb",
          borderRadius: "4px",
          height: "12px",
          width: "100%",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${larguraMeta}%`,
            height: "100%",
            backgroundColor: corMeta,
            transition: "width 0.5s ease",
          }}
        ></div>
      </div>

      <div
        style={{
          fontSize: "0.75rem",
          color: "#6b7280",
          textAlign: "center",
          marginTop: "8px",
        }}
      >
        Escala máxima: {formatHoras(MAX_LIMIT)}
      </div>
    </div>
  );
}
