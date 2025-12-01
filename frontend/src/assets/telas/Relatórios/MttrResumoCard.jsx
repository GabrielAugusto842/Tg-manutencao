// src/componentes/Relatorios/MttrResumoCard.jsx

import React, { useState, useEffect } from "react";
import { formatHoras, getMttrColor } from "../../Services/formatters";
import "./DashboardGeral.css";
import DashboardMTTR from "./DashboardMTTR.jsx";

const API_URL = "http://localhost:3002/api/relatorios";

export default function MttrResumoCard({
  dataInicial,
  dataFinal,
  idSetor,
  metaHoras,
  setMetaHoras,
  metaMinutos,
  setMetaMinutos,
  metaMTTR, // Valor da meta em horas decimais
}) {
  const [mttrGeral, setMttrGeral] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  // Usa a meta recebida por prop
  const meta = metaMTTR || 4;

  useEffect(() => {
    const fetchWithRetry = async (url, options, retries = 3) => {
      for (let i = 0; i < retries; i++) {
        try {
          const resposta = await fetch(url, options);
          if (resposta.status === 429 && i < retries - 1) {
            const delay = Math.pow(2, i) * 1000;
            await new Promise((resolve) => setTimeout(resolve, delay));
            continue;
          }
          return resposta;
        } catch (error) {
          if (i === retries - 1) throw error;
          const delay = Math.pow(2, i) * 1000;
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
      throw new Error("Falha na requisição após várias tentativas.");
    };

    const buscarMTTR = async () => {
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

        const respostaGeral = await fetchWithRetry(
          `${API_URL}/mttr-geral${query}`,
          { headers }
        );

        if (!respostaGeral.ok) throw new Error("Erro ao buscar MTTR geral");
        const dadosGeral = await respostaGeral.json();
        setMttrGeral(dadosGeral?.mttr ?? 0);
      } catch (e) {
        console.error("Erro ao buscar MTTR:", e);
        setErro(e.message);
      } finally {
        setCarregando(false);
      }
    };
    buscarMTTR();
  }, [dataInicial, dataFinal, idSetor]);

  if (carregando)
    return <div className="kpi-card loading">Carregando MTTR...</div>;
  if (erro) return <div className="kpi-card error">Erro: {erro}</div>;

  return (
    <div className="kpi-card mttr">
      <h4 className="card-titulo">MTTR Geral no Período</h4>

      <div className="kpi-content">
        <div className="kpi-valor-principal kpi-valor-grande">
          <span
            className="valor-indicador"
            style={{ color: getMttrColor(mttrGeral, meta) }}
          >
            {formatHoras(mttrGeral)}
          </span>
          <p className="card-meta">Meta (Abaixo de): {formatHoras(meta)}</p>
        </div>

        <div className="kpi-grafico-rosca kpi-grafico-mttr">
          {/* Passa o valor atual da meta (metaMTTR) para o gráfico/barra */}
          <DashboardMTTR mttrValue={mttrGeral} valorMeta={meta} />
        </div>
      </div>

      {/* BLOCO DA META NO FINAL DO CARD */}
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
