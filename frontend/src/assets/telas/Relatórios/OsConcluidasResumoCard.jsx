// OsConcluidasResumoCard.jsx

import React, { useState, useEffect } from "react";
import "./DashboardGeral.css"; // Estilos compartilhados

const API_URL = "http://localhost:3002/api/relatorios";

export default function OsConcluidasResumoCard({ dataInicial, dataFinal }) {
  const [totalConcluidas, setTotalConcluidas] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    const buscarTotalOs = async () => {
      setCarregando(true);
      setErro(null);
      try {
        const params = new URLSearchParams();
        if (dataInicial) params.append("dataInicial", dataInicial);
        if (dataFinal) params.append("dataFinal", dataFinal);
        const query = params.toString() ? `?${params.toString()}` : "";
        const headers = {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        };

        // Chamando o endpoint: /os-concluidas-geral
        const resposta = await fetch(`${API_URL}/os-concluidas-geral${query}`, {
          headers,
        });

        if (!resposta.ok)
          throw new Error("Erro ao buscar total de O.S. concluídas");
        const dados = await resposta.json();

        setTotalConcluidas(dados?.totalOsConcluidas ?? 0);
      } catch (e) {
        setErro(e.message);
      } finally {
        setCarregando(false);
      }
    };
    buscarTotalOs();
  }, [dataInicial, dataFinal]);

  if (carregando)
    return (
      <div className="kpi-card loading">Carregando O.S. Concluídas...</div>
    );
  if (erro) return <div className="kpi-card error">Erro: {erro}</div>;

  return (
    <div className="kpi-card os-concluidas">
      <h4 className="card-titulo">O.S. Concluídas no Período</h4>
      <div className="kpi-content centralizado">
        <div className="kpi-valor-principal">
          <span
            className="valor-indicador"
            style={{ color: "#4e73df" }} // Azul padrão
          >
            {totalConcluidas.toLocaleString("pt-BR")}
          </span>
          <p className="card-meta">Ordens Concluídas</p>
        </div>
      </div>
    </div>
  );
}
