import React from "react";
import RankingMaquinasOrdens from "./RankingMaquinasOrdens";
import RankingMaquinasCustos from "./RankingMaquinasCustos"; // futuro card
import "./RankingStyles.css";

export default function DashboardRanking({ mes, ano, idSetor }) {
  return (
    <div className="dashboard-container">
      {/* Título geral do dashboard */}
      <h1 className="page-title">Dashboard de Rankings</h1>

      {/* Grid de cards */}
      <div className="dashboard-kpi-grid">
        {/* Card: Máquinas com mais ordens */}
        <RankingMaquinasOrdens mes={mes} ano={ano} idSetor={idSetor} />

        {/* Card: Máquinas com mais custos */}
        <RankingMaquinasCustos mes={mes} ano={ano} idSetor={idSetor} />

        {/* Aqui você pode adicionar outros cards */}
      </div>
    </div>
  );
}
