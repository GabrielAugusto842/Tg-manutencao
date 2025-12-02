// src/componentes/Relatorios/MtbfResumoCard.jsx

import React, { useState, useEffect } from "react";
import { formatHoras, getMtbfColor } from "../../Services/formatters";
import "./DashboardGeral.css";
import DashboardMTBF from "./DashboardMTBF.jsx";

const API_URL = "http://localhost:3002/api/relatorios";

export default function MtbfResumoCard({
  dataInicial,
  dataFinal,
  idSetor,
  metaMtbfHoras,
  setMetaMtbfHoras,
  metaMtbfMinutos,
  setMetaMtbfMinutos,
  metaMTBF, // meta em decimal (horas)
}) {
  const [mtbfGeral, setMtbfGeral] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  const meta = metaMTBF ?? 200; // default

  useEffect(() => {
    const buscarMTBF = async () => {
      setCarregando(true);
      setErro(null);

      try {
        const params = new URLSearchParams();
        if (dataInicial) params.append("dataInicial", dataInicial);
        if (dataFinal) params.append("dataFinal", dataFinal);
        if (idSetor) params.append("idSetor", idSetor);

        const query = params.toString() ? `?${params.toString()}` : "";
        const headers = {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        };

        const res = await fetch(`${API_URL}/mtbf-geral${query}`, { headers });
        if (!res.ok) throw new Error("Erro ao buscar MTBF geral");

        const dados = await res.json();
        setMtbfGeral(dados?.mtbf ?? 0);
      } catch (e) {
        setErro(e.message);
      } finally {
        setCarregando(false);
      }
    };

    buscarMTBF();
  }, [dataInicial, dataFinal, idSetor]);

  if (carregando)
    return <div className="kpi-card loading">Carregando MTBF...</div>;
  if (erro) return <div className="kpi-card error">Erro: {erro}</div>;

  return (
    <div className="kpi-card mtbf">
      <h4 className="card-titulo">MTBF Geral no Período</h4>

      <div className="kpi-content">
        <div className="kpi-valor-principal kpi-valor-grande">
          <span
            className="valor-indicador"
            style={{ color: getMtbfColor(mtbfGeral, meta) }}
          >
            {formatHoras(mtbfGeral)}
          </span>
          <p className="card-meta">Meta (Acima de): {formatHoras(meta)}</p>
        </div>

        <div className="kpi-grafico-rosca kpi-grafico-mttr">
          <DashboardMTBF mtbfValue={mtbfGeral} valorMeta={meta} />
        </div>
      </div>

      {/* INPUTS DA META */}
      <div
        className="mttr-meta-container-inline no-print"
        style={{ marginTop: "28px" }}
      >
        <label className="font-semibold mr-2">Definir Meta:</label>

        <div className="input-time-card">
          <input
            type="number"
            value={metaMtbfHoras}
            onChange={(e) =>
              setMetaMtbfHoras(Math.max(0, Number(e.target.value)))
            }
            min={0}
          />
          <span>h</span>
        </div>

        <div className="input-time-card">
          <input
            type="number"
            value={metaMtbfMinutos}
            onChange={(e) =>
              setMetaMtbfMinutos(
                Math.min(59, Math.max(0, Number(e.target.value)))
              )
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
