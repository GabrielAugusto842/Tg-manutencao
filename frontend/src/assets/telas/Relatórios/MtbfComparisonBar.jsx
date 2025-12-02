// src/componentes/Relatorios/MttrComparisonBar.jsx

import React from "react";
import { formatHoras, getMttrColor } from "../../Services/formatters";

// Escala dinâmica com mínimo de 24h
const calcularEscala = (valorAtual, valorMeta) => {
  const maior = Math.max(valorAtual, valorMeta);
  return Math.max(250, maior * 1.15); // margem de 15%
};

export default function MttrComparisonBar({ valorAtual, valorMeta }) {
  
  const escala = calcularEscala(valorAtual, valorMeta);

  // Larguras proporcionais
  const larguraAtual = Math.min((valorAtual / escala) * 100, 100);
  const larguraMeta = Math.min((valorMeta / escala) * 100, 100);

  // Cores
  const corAtual = getMttrColor(valorAtual, valorMeta);
  const corMeta = "#0ebc0eff";

  return (
    <div style={{ marginTop: "25px", padding: "0 5px" }}>

      {/* Texto valor atual */}
      <div
        style={{
          fontSize: "1rem",
          fontWeight: "700",
          color: corAtual,
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "4px",
        }}
      >
        <span>MTTR Atual:</span>
        <span>{formatHoras(valorAtual)}</span>
      </div>

      {/* Barra atual */}
      <div
        style={{
          backgroundColor: "#e5e7eb",
          borderRadius: "4px",
          height: "12px",
          marginBottom: "12px",
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

      {/* Texto meta */}
      <div
        style={{
          fontSize: "1rem",
          fontWeight: "700",
          color: corMeta,
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "6px",
        }}
      >
        <span>MTTR Meta:</span>
        <span>{formatHoras(valorMeta)}</span>
      </div>

      {/* Barra meta */}
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
    </div>
  );
}
