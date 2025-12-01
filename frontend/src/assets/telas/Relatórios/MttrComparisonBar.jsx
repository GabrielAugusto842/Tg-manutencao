// src/componentes/Relatorios/MttrComparisonBar.jsx

import React from "react";
import { formatHoras, getMttrColor } from "../../Services/formatters";

// Valor máximo da escala fixa 
const MAX_LIMIT = 24; 

export default function MttrComparisonBar({ valorAtual, valorMeta }) {
  // Calcula largura percentual das barras em relação ao limite fixo
  const larguraAtual = Math.min((valorAtual / MAX_LIMIT) * 100, 100);
  const larguraMeta = Math.min((valorMeta / MAX_LIMIT) * 100, 100);

  // Define cores
  const corAtual = getMttrColor(valorAtual, valorMeta); 
  const corMeta = "#0ebc0eff"; // Verde fixo para meta

  return (
    <div style={{ 
        marginTop: "25px", /* Empurra o bloco das barras para baixo */
        padding: "0 5px" 
    }}>
      {/* Barra do valor atual */}
      <div
        style={{
          fontSize: "1rem", /* AUMENTADO: Tamanho da fonte */
          fontWeight: "700", /* AUMENTADO: Espessura da fonte */
          color: corAtual,
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "4px", /* Espaço abaixo do texto */
        }}
      >
        <span>MTTR Atual:</span>
        <span>{formatHoras(valorAtual)}</span>
      </div>

      <div
        style={{
          backgroundColor: "#e5e7eb",
          borderRadius: "4px",
          height: "12px", /* AUMENTADO: Grossura da barra */
          marginBottom: "14px", /* Espaço abaixo da barra */
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
          fontSize: "1rem", /* AUMENTADO: Tamanho da fonte */
          fontWeight: "700", /* AUMENTADO: Espessura da fonte */
          color: corMeta,
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "6px",
        }}
      >
        <span>MTTR Meta:</span>
        <span>{formatHoras(valorMeta)}</span>
      </div>

      <div
        style={{
          backgroundColor: "#e5e7eb",
          borderRadius: "4px",
          height: "12px", /* AUMENTADO: Grossura da barra */
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
          marginTop: "12px", /* Espaçamento abaixo da barra */
        }}
      >
      </div>
    </div>
  );
}
