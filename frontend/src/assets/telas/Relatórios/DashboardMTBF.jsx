import React from "react";
// Importa de Services/formatters (resolvendo o erro de compilação)
import { getMtbfColor } from "../../Services/formatters";
import "./DashboardGeral.css"; // Importa estilos

// Define o limite superior para a escala visual.
const ESCALA_VISUAL_MAX = (valorAtual, valorMeta) => {
  // Garante que a barra total seja sempre ligeiramente maior que o maior valor (atual ou meta)
  const scale = Math.max(valorAtual, valorMeta) * 1.1;
  // Garante uma escala mínima, caso os valores sejam zero
  return Math.max(scale, 1);
};

// Assume que mtbfValue e valorMeta estão em HORAS DECIMAIS
export default function DashboardMTBF({ mtbfValue, valorMeta }) {
  const valorAtual = mtbfValue || 0;
  const meta = valorMeta || 200.0;
  // Obtém a cor com base na comparação (verde se >= meta)
  const corBarra = getMtbfColor(valorAtual, meta);

  const maxScale = ESCALA_VISUAL_MAX(valorAtual, meta);

  // Calcula os percentuais
  const percentualBarra = (valorAtual / maxScale) * 100;
  const percentualMarcador = (meta / maxScale) * 100;

  // Limita a barra visualmente a 100%
  const larguraBarra = Math.min(percentualBarra, 100);

  // Usa a cor de sucesso (#0ebc0eff - verde) para o marcador se ele for atingido (ou ultrapassado)
  // Se o valor da barra for maior ou igual ao marcador, usa a cor da barra (verde ou vermelho). Caso contrário, a cor do marcador é verde.
  const corMarcador =
    percentualBarra >= percentualMarcador ? corBarra : "#0ebc0eff";

  return (
    <div className="kpi-progress-wrapper" style={{ position: "relative" }}>
      {/* Linha de título com o valor atual */}
      <div className="kpi-progress-line">
      
      </div>

      {/* Barra de Progresso Principal */}
      <div className="kpi-progress-bar-background">
        <div
          className="kpi-progress-bar-foreground"
          style={{ width: `${larguraBarra}%`, backgroundColor: corBarra }}
        ></div>

        {/* Marcador de Meta (Linha Vertical) */}
        {percentualMarcador <= 100 && (
          <div
            // Marcador vertical da meta
            style={{
              position: "absolute",
              left: `${percentualMarcador}%`,
              top: "10px",
              height: "100%",
              width: "3px",
              backgroundColor: corMarcador,
              transform: "translateX(-50%)",
              borderRadius: "4px",
            }}
          ></div>
        )}
      </div>

      {/* Rodapé com Meta e Escala Máxima */}
      <div className="kpi-progress-text-footer">
        
      </div>
    </div>
  );
}
