import React, { useState, useEffect } from "react";
import { formatHoras, getMttaColor } from "../../Services/formatters";
import "./DashboardGeral.css";
import DashboardMTTA from "./DashboardMTTA.jsx";

const API_URL = "http://localhost:3002/api/relatorios";

export default function MttaResumoCard({
  mes,
  ano,
  idSetor,
  metaHoras,
  setMetaHoras,
  metaMinutos,
  setMetaMinutos,
  metaMTTA,
  onDataFetched,
}) {
  const [mtta, setMtta] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const [aviso, setAviso] = useState("");

  const metaDecimal =
    (metaHoras || 0) + (metaMinutos || 0) / 60 || metaMTTA || 0.5;

  useEffect(() => {
    const fetchMTTA = async () => {
      setCarregando(true);
      setErro(null);
      setAviso("");

      try {
        const params = new URLSearchParams();
        if (mes) params.append("mes", mes);
        if (ano) params.append("ano", ano);
        if (idSetor) params.append("idSetor", idSetor);

        const resposta = await fetch(
          `${API_URL}/mtta-geral?${params.toString()}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (!resposta.ok) throw new Error("Erro ao buscar MTTA");
        const dados = await resposta.json();

        setMtta(dados.mttaHoras ?? 0);
        setAviso(dados.mensagem || "");

        if (onDataFetched) {
          onDataFetched({
            indicador: "MTTA",
            valor: dados.mttaHoras ?? null,
            aviso: dados.mensagem || "",
            meta: metaMTTA,
          });
        }
      } catch (e) {
        setErro(e.message);
      } finally {
        setCarregando(false);
      }
    };

    fetchMTTA();
  }, [mes, ano, idSetor, metaMTTA]);

  if (carregando)
    return <div className="kpi-card loading">Carregando MTTA...</div>;
  if (erro) return <div className="kpi-card error">Erro: {erro}</div>;

  return (
    <div className="kpi-card mttr">
      <h4 className="card-titulo">MTTA Geral no Período</h4>
      <div className="kpi-content">
        <div className="kpi-valor-principal kpi-valor-grande">
          <span style={{ color: getMttaColor(mtta, metaDecimal) }}>
            {!aviso ? formatHoras(mtta) : "—"}
          </span>
          <p className="card-meta">
            Meta (Abaixo de): {formatHoras(metaDecimal)}
          </p>
          {aviso && <p className="card-aviso">{aviso}</p>}
        </div>
        <div className="kpi-grafico-rosca kpi-grafico-mttr">
          <DashboardMTTA mttaValue={mtta} valorMeta={metaDecimal} />
        </div>
      </div>

      <div className="mttr-meta-container-inline no-print">
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
