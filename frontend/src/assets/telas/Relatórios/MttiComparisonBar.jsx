import React from "react";

export default function MttiComparisonBar({ valorAtual }) {
  const maxHoras = Math.max(valorAtual, 1);
  const largura = Math.min((valorAtual / maxHoras) * 100, 100);

  return (
    <div className="comparison-bar-container">
      <div className="comparison-bar-filler" style={{ width: `${largura}%` }} />
      <p className="comparison-bar-text">{valorAtual.toFixed(2)} h</p>
    </div>
  );
}
