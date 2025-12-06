import React, { useState, useEffect } from "react";
import { formatHoras, getMtbfColor } from "../../Services/formatters";
import "./DashboardGeral.css";
import DashboardMTBF from "./DashboardMTBF.jsx";
import api from "../../Services/api.jsx";

export default function MtbfResumoCard({
  mes,
  ano,
  idSetor,
  metaMtbfHoras,
  setMetaMtbfHoras,
  metaMtbfMinutos,
  setMetaMtbfMinutos,
  metaMTBF,
  onDataFetched,
}) {
  const [mtbfGeral, setMtbfGeral] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const [aviso, setAviso] = useState("");

  const meta = metaMTBF ?? 200;

  useEffect(() => {
    const fetchMTBF = async () => {
      setCarregando(true);
      setErro(null);
      setAviso("");

      try {
        const params = new URLSearchParams();
        if (mes) params.append("mes", mes);
        if (ano) params.append("ano", ano);
        if (idSetor) params.append("idSetor", idSetor);

        const resp = await api.get("/relatorios/mtbf-geral", {
          params: params,
        });

        const dados = resp.data;

        setMtbfGeral(dados.mtbf ?? 0);
        setAviso(dados.aviso || "");

        if (onDataFetched) {
          onDataFetched({
            indicador: "MTBF",
            valor: dados.mtbf ?? null,
            aviso: dados.aviso || "",
            meta: metaMTBF,
          });
        }
      } catch (e) {
        setErro(e.message);
      } finally {
        setCarregando(false);
      }
    };

    fetchMTBF();
  }, [mes, ano, idSetor, metaMTBF]);

  if (carregando)
    return <div className="kpi-card loading">Carregando MTBF...</div>;
  if (erro) return <div className="kpi-card error">Erro: {erro}</div>;

  return (
    <div className="kpi-card mtbf">
      <h4 className="card-titulo">MTBF Geral no Período</h4>
      <div className="kpi-content">
        <div className="kpi-valor-principal kpi-valor-grande">
          <span style={{ color: getMtbfColor(mtbfGeral ?? 0, meta) }}>
            {!aviso ? formatHoras(mtbfGeral) : "—"}
          </span>

          <p className="card-meta">Meta (Acima de): {formatHoras(meta)}</p>
          {aviso && <p className="card-aviso">{aviso}</p>}
        </div>
        <div className="kpi-grafico-rosca kpi-grafico-mttr">
          <DashboardMTBF mtbfValue={mtbfGeral ?? 0} valorMeta={meta} />
        </div>
      </div>

      <div className="mttr-meta-container-inline no-print">
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
