// src/componentes/Relatorios/MtbfComparisonBar.jsx

import React from "react";
import { formatHoras, getMtbfColor } from "../../Services/formatters";

// Escala dinâmica baseada nos valores
const calcularEscala = (valorAtual, valorMeta) => {
  const maior = Math.max(valorAtual, valorMeta);
  return Math.max(200, maior * 1.15); // margem de 15%, mínimo 200h
};

export default function MtbfComparisonBar({ valorAtual, valorMeta }) {
  const escala = calcularEscala(valorAtual, valorMeta);

  // Larguras proporcionais
  const larguraAtual = Math.min((valorAtual / escala) * 100, 100);
  const larguraMeta = Math.min((valorMeta / escala) * 100, 100);

  // Cores
  const corAtual = getMtbfColor(valorAtual, valorMeta); // verde se bateu a meta
  const corMeta = "#0ebc0eff"; // verde fixo para meta

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
        <span>MTBF Atual:</span>
        <span>{formatHoras(valorAtual)}</span>
      </div>

      {/* Barra do valor atual */}
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
        <span>MTBF Meta:</span>
        <span>{formatHoras(valorMeta)}</span>
      </div>

      {/* Barra da meta */}
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
