import React, { useState, useEffect } from "react";
import { formatHoras, getMttaColor } from "../../Services/formatters";
import "./DashboardGeral.css";
import DashboardMTTA from "./DashboardMTTA.jsx";

const API_URL = "http://localhost:3002/api/relatorios";

export default function MttaResumoCard({
  dataInicial,
  dataFinal,
  idSetor,
  metaHoras,
  setMetaHoras,
  metaMinutos,
  setMetaMinutos,
  metaMTTA, // Meta em horas decimais
}) {
  const [mtta, setMtta] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  const metaDefault = metaMTTA || 0.5; // Meta padrão: 30 min = 0.5 horas
  const metaDecimal = (metaHoras || 0) + (metaMinutos || 0) / 60 || metaDefault;

  useEffect(() => {
    const fetchMTTA = async () => {
      setCarregando(true);
      setErro(null);

      try {
        const params = new URLSearchParams();
        if (dataInicial) params.append("dataInicial", dataInicial);
        if (dataFinal) params.append("dataFinal", dataFinal);
        if (idSetor) params.append("idSetor", idSetor);

        const query = params.toString() ? `?${params.toString()}` : "";

        const resposta = await fetch(`${API_URL}/mtta-geral${query}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });

        if (!resposta.ok) throw new Error("Erro ao buscar MTTA");
        const dados = await resposta.json();

        setMtta(dados?.mttaHoras ?? 0);
      } catch (e) {
        setErro(e.message);
      } finally {
        setCarregando(false);
      }
    };

    fetchMTTA();
  }, [dataInicial, dataFinal, idSetor]);

  if (carregando) return <div className="kpi-card loading">Carregando MTTA...</div>;
  if (erro) return <div className="kpi-card error">Erro: {erro}</div>;

  return (
    <div className="kpi-card mttr">
      <h4 className="card-titulo">MTTA Geral no Período</h4>

      <div className="kpi-content">
        <div className="kpi-valor-principal kpi-valor-grande">
          <span
            className="valor-indicador"
            style={{ color: getMttaColor(mtta, metaDecimal) }}
          >
            {formatHoras(mtta)}
          </span>
          <p className="card-meta">Meta (Abaixo de): {formatHoras(metaDecimal)}</p>
        </div>

        <div className="kpi-grafico-rosca kpi-grafico-mttr">
          <DashboardMTTA mttaValue={mtta} valorMeta={metaDecimal} />
        </div>
      </div>

      <div className="mttr-meta-container-inline no-print" style={{ marginTop: "26px" }}>
        <label className="font-semibold mr-2">Definir Meta:</label>

        <div className="input-time-card">
          <input
            type="number"
            value={metaHoras}
            onChange={(e) => setMetaHoras(Math.max(0, Number(e.target.value)))}
            min={0}
          />
          <span>h</span>
        </div>

        <div className="input-time-card">
          <input
            type="number"
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
