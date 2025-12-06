// src/componentes/Relatorios/MttrAnualChart.jsx

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
import "./DashboardGeral.css";

const formatHoras = (hours) => {
  if (typeof hours !== "number" || isNaN(hours) || hours < 0) {
    return "0h 0m";
  }
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return `${h}h ${m}m`;
};

const formatChartData = (data) => {
  return data.map((item) => ({
    ...item,
    mttr: item.mttr ?? 0,
  }));
};

// Componente principal do gráfico
export default function MttrAnualChart({ idSetor }) {
  const [dataAnual, setDataAnual] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  // Define o ano atual como padrão de filtro
  const anoAtual = new Date().getFullYear();

  useEffect(() => {
    const buscarMttrAnual = async () => {
      setCarregando(true);
      setErro(null);

      try {
        const params = new URLSearchParams();

        // Filtra pelo ano atual
        params.append("ano", anoAtual);

        // Se houver setor selecionado, ele também deve ser usado no filtro anual
        if (idSetor) params.append("idSetor", idSetor);

        const resp = await api.get("/relatorios/mttr-anual", {
          params: params,
        });

        const dados = resp.data;
        setDataAnual(formatChartData(dados));
      } catch (e) {
        console.error("Erro ao buscar MTTR anual:", e);
        setErro(e.message);
      } finally {
        setCarregando(false);
      }
    };

    buscarMttrAnual();
  }, [idSetor, anoAtual]); // Refaz a busca ao trocar o setor ou mudar o ano

  if (carregando)
    return (
      <div className="kpi-card chart-card loading" style={{ height: "300px" }}>
        Carregando MTTR Anual...
      </div>
    );

  if (erro)
    return (
      <div className="kpi-card chart-card error" style={{ height: "300px" }}>
        Erro: {erro}
      </div>
    );

  // Verifica se há dados válidos, ignorando apenas os zeros padrão
  const hasData = dataAnual.some((item) => item.mttr > 0);

  if (!hasData)
    return (
      <div
        className="kpi-card chart-card"
        style={{ height: "300px", textAlign: "center" }}
      >
        <h4 className="card-titulo">MTTR Anual ({anoAtual})</h4>
        <p className="mt-4 text-gray-500">Sem dados de MTTR para o período.</p>
      </div>
    );

  return (
    <div className="kpi-card chart-card full-width">
      <h4 className="card-titulo">
        MTTR Mensal no Ano ({anoAtual})
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
            formatter={(value) => [formatHoras(value), "MTTR"]}
            labelFormatter={(label) => `Período: ${label}`}
          />
          <Legend />

          <Line
            type="monotone"
            dataKey="mttr"
            name="MTTR (h)"
            stroke="#F59E0B"
            strokeWidth={3}
            dot={{ r: 5 }}
            activeDot={{ r: 8, fill: "#F59E0B" }}
          />
        </LineChart>
      </ResponsiveContainer>

      <p className="text-xs text-gray-500 mt-2 text-center">
        O MTTR é o tempo médio entre a abertura e a conclusão de uma ordem de serviço
      </p>
    </div>
  );
}
