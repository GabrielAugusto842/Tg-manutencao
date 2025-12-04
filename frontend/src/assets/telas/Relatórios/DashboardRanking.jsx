import RankingSetorCustos from "./RankingSetorCustos";
import RankingMaquinasCustos from "./RankingMaquinasCustos"; 
import RankingMaquinasOrdens from "./RankingMaquinasOrdens";
import RankingSetorOrdens from "./RankingSetorOrdens";// novo card
import RankingUsuariosOrdens from "./RankingUsuariosOrdens";
import RankingUsuariosCustos from "./RankingUsuariosCustos";

export default function DashboardRanking({ mes, ano, idSetor }) {
  return (
    <div className="dashboard-container">
      <h1 className="page-title">Dashboard de Rankings</h1>

      <div className="dashboard-kpi-grid">
        <RankingMaquinasOrdens mes={mes} ano={ano} idSetor={idSetor} />
        <RankingSetorOrdens mes={mes} ano={ano} />
        <RankingUsuariosOrdens mes={mes} ano={ano}  />
        <RankingMaquinasCustos mes={mes} ano={ano} idSetor={idSetor} />
        <RankingSetorCustos mes={mes} ano={ano} />
        <RankingUsuariosCustos mes={mes} ano={ano}  /> 
      </div>
    </div>
  );
}
