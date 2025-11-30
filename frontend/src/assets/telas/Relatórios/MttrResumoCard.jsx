// src/componentes/Relatorios/MttrResumoCard.jsx (AJUSTADO PARA idSetor)

import React, { useState, useEffect } from "react";
import {
  formatHoras,
  getMttrColor,
  MTTR_META_HORAS,
} from "../../Services/formatters";
import "./DashboardGeral.css";
import DashboardMTTR from "./DashboardMTTR.jsx";

const API_URL = "http://localhost:3002/api/relatorios";

// 🎯 1. RECEBE idSetor NAS PROPS
export default function MttrResumoCard({ dataInicial, dataFinal, idSetor }) {
  const [mttrGeral, setMttrGeral] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    // Função de retry com backoff exponencial (mantida inalterada)
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

        // 🎯 2. ADICIONA idSetor AOS PARÂMETROS DE CONSULTA (QUERY STRING)
        if (idSetor) params.append("idSetor", idSetor);

        const query = params.toString() ? `?${params.toString()}` : "";
        const headers = {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        };

        const respostaGeral = await fetchWithRetry(
          `${API_URL}/mttr-geral${query}`,
          {
            headers,
          }
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
    buscarMTTR(); // 🎯 3. INCLUI idSetor NO ARRAY DE DEPENDÊNCIAS
  }, [dataInicial, dataFinal, idSetor]);

  if (carregando)
    return <div className="kpi-card loading">Carregando MTTR...</div>;
  if (erro) return <div className="kpi-card error">Erro: {erro}</div>; // ... (Abaixo, o JSX do componente permanece inalterado) ...

  return (
    <div className="kpi-card mttr">
           <h4 className="card-titulo">MTTR Geral no Período</h4>   {" "}
      <div className="kpi-content">
                     {/* 👈 Container Flex principal */} {" "}
        <div className="kpi-valor-principal kpi-valor-grande">
                           {/* 👈 NOVA CLASSE para dar mais peso visual */}
                {" "}
          <span
            className="valor-indicador"
            style={{ color: getMttrColor(mttrGeral, MTTR_META_HORAS) }}
          >
                     {formatHoras(mttrGeral)}   {" "}
          </span>{" "}
                    {" "}
          <p className="card-meta">Meta: {formatHoras(MTTR_META_HORAS)}</p> 
              {" "}
        </div>{" "}
                 {/* Ocupa a coluna direita com o gráfico */}      {" "}
        <div className="kpi-grafico-rosca kpi-grafico-mttr">
                       {/* 👈 NOVA CLASSE para MTTR/MTBF */}
             <DashboardMTTR mttrValue={mttrGeral} />   {" "}
        </div>{" "}
          {" "}
      </div>{" "}
        {" "}
    </div>
  );
}
