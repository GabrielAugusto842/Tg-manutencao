import React, { useState, useEffect } from "react";
import { formatHoras, getMttrColor } from "../../Services/formatters";
import "./DashboardGeral.css";
import DashboardMTTR from "./DashboardMTTR.jsx";

const API_URL = "http://localhost:3002/api/relatorios";

export default function MttrResumoCard({
  mes,
  ano,
  idSetor,
  metaHoras,
  setMetaHoras,
  metaMinutos,
  setMetaMinutos,
  metaMTTR,
  onDataFetched,
}) {
  const [mttrGeral, setMttrGeral] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const [aviso, setAviso] = useState("");

  const meta = metaMTTR ?? 4;

  useEffect(() => {
    const fetchMTTR = async () => {
      setCarregando(true);
      setErro(null);
      setAviso("");

      try {
        const params = new URLSearchParams();
        if (mes) params.append("mes", mes);
        if (ano) params.append("ano", ano);
        if (idSetor) params.append("idSetor", idSetor);

        const resposta = await fetch(`${API_URL}/mttr-geral?${params.toString()}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });

        if (!resposta.ok) throw new Error("Erro ao buscar MTTR");

        const dados = await resposta.json();

        if (dados.mensagem) {
          setMttrGeral(null);
          setAviso(dados.mensagem);
        } else {
          setMttrGeral(dados.mttr ?? 0);
          setAviso("");
        }

        if (onDataFetched) {
          onDataFetched({
            indicador: "MTTR",
            valor: dados.mttr ?? null,
            aviso: dados.mensagem || "",
            meta: metaMTTR,
          });
        }
      } catch (e) {
        setErro(e.message);
      } finally {
        setCarregando(false);
      }
    };

    fetchMTTR();
  }, [mes, ano, idSetor, metaMTTR]);

  if (carregando) return <div className="kpi-card loading">Carregando MTTR...</div>;
  if (erro) return <div className="kpi-card error">Erro: {erro}</div>;

  return (
    <div className="kpi-card mttr">
      <h4 className="card-titulo">MTTR Geral no Período</h4>
      <div className="kpi-content">
        <div className="kpi-valor-principal kpi-valor-grande">
          <span style={{ color: getMttrColor(mttrGeral ?? 0, meta) }}>
            {mttrGeral !== null ? formatHoras(mttrGeral) : "—"}
          </span>
          <p className="card-meta">Meta (Abaixo de): {formatHoras(meta)}</p>
          {aviso && <p className="card-aviso">{aviso}</p>}
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
            onChange={(e) => setMetaMinutos(Math.min(59, Math.max(0, Number(e.target.value))))}
            min={0}
            max={59}
          />
          <span>min</span>
        </div>
      </div>
    </div>
  );
}
