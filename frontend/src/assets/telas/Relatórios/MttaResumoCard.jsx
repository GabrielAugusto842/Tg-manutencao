import React, { useState, useEffect } from "react";
import { formatHoras } from "../../Services/formatters.jsx";
import DashboardMTTI from "./DashboardMTTA.jsx";
import "./DashboardGeral.css";

const API_URL = "http://localhost:3002/api/relatorios";

export default function MttiResumoCard({ dataInicial, dataFinal, idSetor }) {
  const [mtti, setMtti] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    const fetchWithRetry = async (url, options, retries = 3) => {
      for (let i = 0; i < retries; i++) {
        try {
          const resposta = await fetch(url, options);
          if (resposta.status === 429 && i < retries - 1) {
            const delay = Math.pow(2, i) * 1000;
            await new Promise((r) => setTimeout(r, delay));
            continue;
          }
          return resposta;
        } catch (err) {
          if (i === retries - 1) throw err;
          const delay = Math.pow(2, i) * 1000;
          await new Promise((r) => setTimeout(r, delay));
        }
      }
    };

    const carregar = async () => {
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

        const resp = await fetchWithRetry(
          `${API_URL}/mtti-geral${query}`,
          { headers }
        );

        if (!resp.ok) throw new Error("Erro ao buscar MTTI");
        const dados = await resp.json();

        setMtti(dados?.mtti ?? 0);
      } catch (e) {
        console.error("Erro ao buscar MTTI:", e);
        setErro(e.message);
      } finally {
        setCarregando(false);
      }
    };

    carregar();
  }, [dataInicial, dataFinal, idSetor]);

  if (carregando)
    return <div className="kpi-card loading">Carregando MTTI...</div>;
  if (erro) return <div className="kpi-card error">Erro: {erro}</div>;

  return (
    <div className="kpi-card mttr">
      <h4 className="card-titulo">MTTA Geral no Período</h4>

      <div className="kpi-content">
        <div className="kpi-valor-principal kpi-valor-grande">
          <span className="valor-indicador">
            {formatHoras(mtti)}
          </span>

          <p className="card-meta">Tempo médio até iniciar reparo</p>
        </div>

        <div className="kpi-grafico-rosca kpi-grafico-mttr">
          <DashboardMTTI mttiValue={mtti} />
        </div>
      </div>
    </div>
  );
}
