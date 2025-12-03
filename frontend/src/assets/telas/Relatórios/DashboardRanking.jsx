import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

const API_URL = "http://localhost:3002/api/relatorios";

export default function DashboardRanking({ mes, ano, idSetor }) {
  const [rankingMaquinasOrdens, setRankingMaquinasOrdens] = useState([]);
  const [rankingSetoresOrdens, setRankingSetoresOrdens] = useState([]);
  const [rankingMaquinasCustos, setRankingMaquinasCustos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    const buscarRankings = async () => {
      setCarregando(true);
      setErro(null);

      try {
        const params = new URLSearchParams();
        if (mes) params.append("mes", mes);
        if (ano) params.append("ano", ano);
        if (idSetor) params.append("idSetor", idSetor);

        const query = params.toString() ? `?${params.toString()}` : "";
        const headers = { Authorization: `Bearer ${localStorage.getItem("token")}` };

        const [resMaquinasOrdens, resSetoresOrdens, resMaquinasCustos] = await Promise.all([
          fetch(`${API_URL}/ranking/maquinas-ordens${query}`, { headers }),
          fetch(`${API_URL}/ranking/setores-ordens${query}`, { headers }),
          fetch(`${API_URL}/ranking/maquinas-custos${query}`, { headers }),
        ]);

        if (!resMaquinasOrdens.ok || !resSetoresOrdens.ok || !resMaquinasCustos.ok) {
          throw new Error("Erro ao buscar rankings.");
        }

        const [dataMaquinasOrdens, dataSetoresOrdens, dataMaquinasCustos] = await Promise.all([
          resMaquinasOrdens.json(),
          resSetoresOrdens.json(),
          resMaquinasCustos.json(),
        ]);

        setRankingMaquinasOrdens(dataMaquinasOrdens);
        setRankingSetoresOrdens(dataSetoresOrdens);
        setRankingMaquinasCustos(dataMaquinasCustos);
      } catch (e) {
        console.error("Erro ao buscar rankings:", e);
        setErro(e.message);
      } finally {
        setCarregando(false);
      }
    };

    buscarRankings();
  }, [mes, ano, idSetor]);

  if (carregando) return <p>Carregando rankings...</p>;
  if (erro) return <p>Erro: {erro}</p>;

  const renderBarChart = (data, dataKey, title, labelFormatter) => (
    <div className="ranking-chart">
      <h4>{title}</h4>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 20, right: 20, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey={labelFormatter} />
          <YAxis />
          <Tooltip />
          <Bar dataKey={dataKey} fill="#F97316" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );

  return (
    <div className="dashboard-ranking">
      {renderBarChart(rankingMaquinasOrdens, "total_ordens", "Máquinas com mais ordens", "maquina")}
      {renderBarChart(rankingSetoresOrdens, "total_ordens", "Setores com mais ordens", "setor")}
      {renderBarChart(rankingMaquinasCustos, "total_custos", "Máquinas com maior custo total", "maquina")}
    </div>
  );
}
