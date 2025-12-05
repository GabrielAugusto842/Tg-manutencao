import RankingSetorCustos from "./RankingSetorCustos";
import RankingMaquinasCustos from "./RankingMaquinasCustos";
import RankingMaquinasOrdens from "./RankingMaquinasOrdens";
import RankingSetorOrdens from "./RankingSetorOrdens"; // novo card
import RankingUsuariosOrdens from "./RankingUsuariosOrdens";
import RankingUsuariosCustos from "./RankingUsuariosCustos";

export default function DashboardRanking({ mes, ano, idSetor, exportPDF }) {
  return (
    <div className="dashboard-container">
      <h1 className="page-title">Dashboard de Rankings</h1>

      {/* Botão PDF */}
      <div className="mb-6">
        <button onClick={exportPDF} className="botao-pdf-relatorio">
          📄 Exportar PDF
        </button>
      </div>

      <div className="dashboard-kpi-grid">
        <RankingMaquinasOrdens mes={mes} ano={ano} idSetor={idSetor} />
        <RankingSetorOrdens mes={mes} ano={ano} />
        <RankingUsuariosOrdens mes={mes} ano={ano} />
        <RankingMaquinasCustos mes={mes} ano={ano} idSetor={idSetor} />
        <RankingSetorCustos mes={mes} ano={ano} />
        <RankingUsuariosCustos mes={mes} ano={ano} />
      </div>
    </div>
  );
}
