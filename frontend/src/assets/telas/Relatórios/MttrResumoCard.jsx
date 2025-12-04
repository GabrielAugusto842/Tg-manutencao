import React, { useState, useEffect } from "react";
import { formatHoras, getMttrColor } from "../../Services/formatters";
import "./DashboardGeral.css";
import DashboardMTTR from "./DashboardMTTR.jsx";

const API_URL = "http://localhost:3002/api/relatorios";

const fetchWithRetry = async (url, options, retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      const resposta = await fetch(url, options);
      if (resposta.status === 429 && i < retries - 1) {
        await new Promise((resolve) => setTimeout(resolve, Math.pow(2, i) * 1000));
        continue;
      }
      return resposta;
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise((resolve) => setTimeout(resolve, Math.pow(2, i) * 1000));
    }
  }
  throw new Error("Falha na requisição após várias tentativas.");
};

export default function MttrResumoCard({
  mes,
  ano,
  idSetor,
  metaHoras,
  setMetaHoras,
  metaMinutos,
  setMetaMinutos,
  metaMTTR,
}) {
  const [mttrGeral, setMttrGeral] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  const meta = metaMTTR ?? 4;

  useEffect(() => {
    const buscarMTTR = async () => {
      setCarregando(true);
      setErro(null);

      try {
        const params = new URLSearchParams();
        if (mes !== "") params.append("mes", mes);
        if (ano !== "") params.append("ano", ano);
        if (idSetor !== "") params.append("idSetor", idSetor);

        const query = params.toString() ? `?${params.toString()}` : "";
        const headers = { Authorization: `Bearer ${localStorage.getItem("token")}` };

        const resposta = await fetchWithRetry(`${API_URL}/mttr-geral${query}`, { headers });
        if (!resposta.ok) throw new Error("Erro ao buscar MTTR geral");

        const dados = await resposta.json();
        setMttrGeral(dados?.mttr ?? 0);
      } catch (e) {
        console.error("Erro ao buscar MTTR:", e);
        setErro(e.message);
      } finally {
        setCarregando(false);
      }
    };

    buscarMTTR();
  }, [mes, ano, idSetor, metaMTTR]);

  if (carregando) return <div className="kpi-card loading">Carregando MTTR...</div>;
  if (erro) return <div className="kpi-card error">Erro: {erro}</div>;

  return (
    <div className="kpi-card mttr">
      <h4 className="card-titulo">MTTR Geral no Período</h4>

      <div className="kpi-content">
        <div className="kpi-valor-principal kpi-valor-grande">
          <span
            className="valor-indicador"
            style={{ color: getMttrColor(mttrGeral ?? 0, meta) }}
          >
            {formatHoras(mttrGeral ?? 0)}
          </span>
          <p className="card-meta">Meta (Abaixo de): {formatHoras(meta)}</p>
        </div>

        <div className="kpi-grafico-rosca kpi-grafico-mttr">
          <DashboardMTTR mttrValue={mttrGeral ?? 0} valorMeta={meta} />
        </div>
      </div>

      <div className="mttr-meta-container-inline no-print">
        <label className="font-semibold mr-2">Definir Meta:</label>

        <div className="input-time-card">
          <input
            type="number"
            step="1"
            value={metaHoras}
            onChange={(e) => setMetaHoras(Math.max(0, Number(e.target.value)))}
            min={0}
          />
          <span>h</span>
        </div>

        <div className="input-time-card">
          <input
            type="number"
            step="1"
            value={metaMinutos}
            onChange={(e) =>
              setMetaMinutos(Math.min(59, Math.max(0, Number(e.target.value))))
            }
            min={0}
            max={59}
          />
          <span>min</span>
        </div>
      </div>
    </div>
  );
}
