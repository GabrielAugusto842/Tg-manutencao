// src/componentes/Relatorios/MttaComparisonBar.jsx

import React from "react";
import { formatHoras, getMttaColor } from "../../Services/formatters";

const MAX_LIMIT = 48; // Escala fixa igual MTTR

export default function MttaComparisonBar({ valorAtual, valorMeta }) {
  const larguraAtual = Math.min((valorAtual / MAX_LIMIT) * 100, 100);
  const larguraMeta = Math.min((valorMeta / MAX_LIMIT) * 100, 100);

  const corAtual = getMttaColor(valorAtual, valorMeta);
  const corMeta = "#0ebc0eff";

  return (
    <div style={{ marginTop: "28px", padding: "0 5px" }}>
      {/* Atual */}
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
        <span>MTTA Atual:</span>
        <span>{formatHoras(valorAtual)}</span>
      </div>

      <div
        style={{
          backgroundColor: "#e5e7eb",
          borderRadius: "4px",
          height: "12px",
          marginBottom: "14px",
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

      {/* Meta */}
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
        <span>MTTA Meta:</span>
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
    </div>
  );
}
