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
import api from "../../Services/api.jsx";

const formatMinutos = (minutes) => {
  if (typeof minutes !== "number" || isNaN(minutes) || minutes < 0)
    return "0h 0m";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}h ${m}m`;
};

const formatChartData = (data) => {
  return data.map((item) => ({
    ...item,
    mttaHoras: item.mttaHoras ? parseFloat(item.mttaHoras) : 0,
    mttaMinutos: item.mttaHoras ? Math.round(item.mttaHoras * 60) : 0, // só para exibir no gráfico
  }));
};

/**
 * Componente MTTA Anual
 * @param {{idSetor: number | string | null}} props
 */
export default function MttaAnualChart({ idSetor }) {
  const [dataAnual, setDataAnual] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  const anoAtual = new Date().getFullYear();

  useEffect(() => {
    const buscarMttaAnual = async () => {
      setCarregando(true);
      setErro(null);

      try {
        const params = new URLSearchParams();
        params.append("ano", anoAtual.toString());
        if (idSetor) params.append("idSetor", idSetor);

        const resp = await api.get("/relatorios/mtta-anual", {
          params: params,
        }); 

        const dados = resp.data;
        setDataAnual(formatChartData(dados));
      } catch (e) {
        console.error("Erro ao buscar MTTA anual:", e);
        setErro(e.message);
      } finally {
        setCarregando(false);
      }
    };

    buscarMttaAnual();
  }, [idSetor, anoAtual]);

  if (carregando)
    return (
      <div className="kpi-card chart-card loading" style={{ height: "300px" }}>
        Carregando MTTA Anual...
      </div>
    );

  if (erro)
    return (
      <div className="kpi-card chart-card error" style={{ height: "300px" }}>
        Erro: {erro}
      </div>
    );

  const hasData = dataAnual.some((item) => item.mttaMinutos > 0);

  if (!hasData)
    return (
      <div
        className="kpi-card chart-card"
        style={{ height: "300px", textAlign: "center" }}
      >
        <h4 className="card-titulo">MTTA Anual ({anoAtual})</h4>
        <p className="mt-4 text-gray-500">Sem dados de MTTA para o período.</p>
      </div>
    );

  return (
    <div className="kpi-card chart-card full-width">
      <h4 className="card-titulo">
        MTTA Mensal no Ano ({anoAtual})
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
            tickFormatter={(value) => formatMinutos(value)}
            stroke="#6b7280"
            domain={[0, "auto"]}
          />
          <Tooltip
            formatter={(value) => [formatMinutos(value), "MTTA"]}
            labelFormatter={(label) => `Período: ${label}`}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="mttaMinutos"
            name="MTTA"
            stroke="#F97316"
            strokeWidth={3}
            dot={{ r: 5 }}
            activeDot={{ r: 8, fill: "#F97316" }}
          />
        </LineChart>
      </ResponsiveContainer>

      <p className="text-xs text-gray-500 mt-2 text-center">
        O MTTA é o tempo médio entre a abertura da Ordem até que ela seja aceita e iniciado a manutenção
      </p>
    </div>
  );
}
