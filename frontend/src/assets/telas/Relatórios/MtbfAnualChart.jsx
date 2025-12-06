import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const formatHoras = (hours) => {
  if (typeof hours !== "number" || isNaN(hours) || hours < 0) {
    return "0h 0m";
  }
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return `${h}h ${m}m`;
};

const API_URL = "http://localhost:3002/api/relatorios";

const formatChartData = (data) => {
  return data.map((item) => ({
    ...item,
    mtbf: item.mtbf ?? 0,
  }));
};

/**
 * Componente para exibir o Gráfico de MTBF Anual (Mean Time Between Failures).
 * Filtra pelo ano atual e pelo setor passado via prop.
 * @param {{idSetor: number | string | null}} props
 */
export default function MtbfAnualChart({ idSetor }) {
  const [dataAnual, setDataAnual] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  // Define o ano atual como padrão de filtro
  const anoAtual = new Date().getFullYear();

  useEffect(() => {
    const buscarMtbfAnual = async () => {
      setCarregando(true);
      setErro(null);

      try {
        const params = new URLSearchParams();

        // Filtra pelo ano atual
        params.append("ano", anoAtual.toString());

        // Se houver setor selecionado, ele deve ser usado no filtro anual
        if (idSetor) params.append("idSetor", idSetor);

        const query = params.toString() ? `?${params.toString()}` : "";
        const headers = {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        };

        const resposta = await fetch(`${API_URL}/mtbf-anual${query}`, {
          headers,
        });

        if (!resposta.ok)
          throw new Error("Erro ao buscar dados de MTBF anual.");

        const dados = await resposta.json();
        setDataAnual(formatChartData(dados));
      } catch (e) {
        console.error("Erro ao buscar MTBF anual:", e);
        setErro(e.message);
      } finally {
        setCarregando(false);
      }
    };

    buscarMtbfAnual();
  }, [idSetor, anoAtual]);

  if (carregando)
    return (
      <div className="kpi-card chart-card loading" style={{ height: "300px" }}>
        Carregando MTBF Anual...
      </div>
    );

  if (erro)
    return (
      <div className="kpi-card chart-card error" style={{ height: "300px" }}>
        Erro: {erro}
      </div>
    );

  const hasData = dataAnual.some((item) => item.mtbf > 0);

  if (!hasData)
    return (
      <div
        className="kpi-card chart-card"
        style={{ height: "300px", textAlign: "center" }}
      >
        <h4 className="card-titulo">MTBF Anual ({anoAtual})</h4>
        <p className="mt-4 text-gray-500">Sem dados de MTBF para o período.</p>
      </div>
    );

  return (
    <div className="kpi-card chart-card full-width">
      <h4 className="card-titulo">
        MTBF Mensal no Ano ({anoAtual})
        {idSetor && (
          <span className="text-sm font-normal text-gray-500 ml-2">
            (Setor Filtrado)
          </span>
        )}
      </h4>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart
          data={dataAnual}
          margin={{ top: 20, right: 20, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          <XAxis dataKey="periodo" stroke="#6b7280" />
          <YAxis
            tickFormatter={(value) => formatHoras(value)}
            stroke="#6b7280"
            domain={[0, "auto"]} // Garante que o eixo Y comece em 0
          />
          <Tooltip
            formatter={(value) => [formatHoras(value), "MTBF"]}
            labelFormatter={(label) => `Período: ${label}`}
          />
          <Legend />

          <Line
            type="monotone"
            dataKey="mtbf"
            name="MTBF (h)"
            stroke="#10B981" // Verde para contraste com o MTTR
            strokeWidth={3}
            dot={{ r: 5 }}
            activeDot={{ r: 8, fill: "#10B981" }}
          />
        </LineChart>
      </ResponsiveContainer>

      <p className="text-xs text-gray-500 mt-2 text-center">
        O MTBF é o tempo médio entre as falhas
      </p>
    </div>
  );
}
