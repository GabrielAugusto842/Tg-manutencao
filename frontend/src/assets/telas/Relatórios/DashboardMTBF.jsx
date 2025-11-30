// src/componentes/Relatorios/DashboardMTBF.jsx (VERSÃO FINAL COM MARCADOR DE META)
import React from "react";
import {
  formatHoras,
  getMtbfColor,
  MTBF_META_HORAS,
} from "../../Services/formatters";

// Define o limite superior para a escala visual.
const ESCALA_VISUAL_MAX = (valorAtual, valorMeta) => {
  // Garante que a barra total seja sempre ligeiramente maior que o maior valor (atual ou meta)
  return Math.max(valorAtual, valorMeta) * 1.1;
};

export default function DashboardMTBF({ mtbfValue }) {
  const valorAtual = mtbfValue || 0;
  const meta = MTBF_META_HORAS;
  const corBarra = getMtbfColor(valorAtual, meta); // 1. Calcula a escala máxima para garantir que o 100% do gráfico é o limite VISUAL

  const maxScale = ESCALA_VISUAL_MAX(valorAtual, meta); // 2. Calcula o percentual para o foreground (barra colorida) em relação à escala visual

  const percentualBarra = (valorAtual / maxScale) * 100; // 3. Calcula o percentual para o MARCADOR de meta

  const percentualMarcador = (meta / maxScale) * 100; // A largura da barra não deve exceder 100% do container

  const larguraBarra = Math.min(percentualBarra, 100); // A cor do marcador pode ser um verde fixo (para meta) ou a cor da barra atual // Vamos usar um verde para Meta Atingida (#10b981) para consistência visual.

  const corMarcador =
    percentualMarcador <= percentualBarra ? corBarra : "#10b981"; // Usa a cor de sucesso se não for ultrapassada

  return (
    <div className="kpi-progress-wrapper" style={{ position: "relative" }}>
      {" "}
      <div className="kpi-progress-bar-background">
        {/* Barra de Progresso (Foreground) */}{" "}
        <div
          className="kpi-progress-bar-foreground"
          style={{ width: `${larguraBarra}%`, backgroundColor: corBarra }}
        ></div>
        {/* 🛑 Marcador de Meta (Linha Vertical) */}{" "}
        {percentualMarcador <= 100 && (
          <div
            style={{
              position: "absolute",
              left: `${percentualMarcador}%`,
              top: "0",
              height: "100%",
              width: "2px", // Espessura
              backgroundColor: corMarcador, // Cor verde ou a cor de status se já estiver acima
              transform: "translateX(-50%)", // Centraliza
              borderRadius: "1px",
            }}
          ></div>
        )}{" "}
      </div>{" "}
      <div className="kpi-progress-text">
        {formatHoras(valorAtual)} / {formatHoras(meta)}{" "}
      </div>{" "}
    </div>
  );
}
