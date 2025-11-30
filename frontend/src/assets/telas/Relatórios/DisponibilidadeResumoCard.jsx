// src/componentes/Relatorios/DisponibilidadeResumoCard.jsx

import React, { useState, useEffect } from "react";
import { formatPercentual } from "../../Services/formatters";
import "./DashboardGeral.css"; // Estilos compartilhados

const API_URL = "http://localhost:3002/api/relatorios";

export default function DisponibilidadeResumoCard({ dataInicial, dataFinal }) {
  const [disponibilidade, setDisponibilidade] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    // Função de retry com backoff exponencial
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

    const buscarDisponibilidade = async () => {
      setCarregando(true);
      setErro(null);
      try {
        const params = new URLSearchParams();
        if (dataInicial) params.append("dataInicial", dataInicial);
        if (dataFinal) params.append("dataFinal", dataFinal);
        const query = params.toString() ? `?${params.toString()}` : "";
        const headers = {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        }; // Chamando o endpoint: /disponibilidade-geral

        const resposta = await fetchWithRetry(
          `${API_URL}/disponibilidade-geral${query}`,
          { headers }
        );

        if (!resposta.ok)
          throw new Error("Erro ao buscar Disponibilidade geral");
        const dados = await resposta.json(); // O backend retorna o valor em decimal (ex: 98.5)

        setDisponibilidade(dados?.disponibilidade ?? 0);
      } catch (e) {
        console.error("Erro ao buscar Disponibilidade:", e);
        setErro(e.message);
      } finally {
        setCarregando(false);
      }
    };
    buscarDisponibilidade();
  }, [dataInicial, dataFinal]);

  if (carregando)
    return (
      <div className="kpi-card loading">Carregando Disponibilidade...</div>
    );
  if (erro) return <div className="kpi-card error">Erro: {erro}</div>; // A cor pode ser condicional se você tiver uma meta, usaremos 95% como boa prática.

  const corPrincipal = disponibilidade >= 95.0 ? "#28a745" : "#ffc107"; // Verde se >= 95%, Amarelo se < 95%

  return (
    <div className="kpi-card disponibilidade">
       <h4 className="card-titulo">Disponibilidade Geral (%)</h4>{" "}
      <div className="kpi-content centralizado">
    {" "}
        <div className="kpi-valor-principal">
         {" "}
          <span className="valor-indicador" style={{ color: corPrincipal }}>
             {formatPercentual(disponibilidade)}{" "}
          </span>
           <p className="card-meta">Tempo Operacional / Tempo Total</p>
          {" "}
        </div>
        {" "}
      </div>
      {" "}
    </div>
  );
}
