import React, { useState, useEffect } from "react";
import "./RankingStyles.css";

const API_URL = "http://localhost:3002/api/relatorios";

const fetchWithRetry = async (url, options, retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      const resposta = await fetch(url, options);
      if (resposta.status === 429 && i < retries - 1) {
        await new Promise(res => setTimeout(res, Math.pow(2, i) * 1000));
        continue;
      }
      return resposta;
    } catch (err) {
      if (i === retries - 1) throw err;
      await new Promise(res => setTimeout(res, 1000));
    }
  }
};

export default function RankingMaquinasOrdens({ mes, ano, idSetor }) {
  const [dados, setDados] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    const carregarDados = async () => {
      setCarregando(true);
      setErro(null);

      try {
        const params = new URLSearchParams();
        if (mes) params.append("mes", mes);
        if (ano) params.append("ano", ano);
        if (idSetor) params.append("idSetor", idSetor);

        const query = params.toString() ? `?${params.toString()}` : "";

        const resp = await fetchWithRetry(`${API_URL}/ranking/maquinas-ordens${query}`, {
          headers: { "Content-Type": "application/json" },
        });

        if (!resp.ok) throw new Error("Erro ao buscar ranking de máquinas.");

        const dadosApi = await resp.json();
        setDados(dadosApi);
      } catch (e) {
        console.error("Erro ao carregar ranking:", e);
        setErro(e.message || "Falha desconhecida ao buscar dados.");
      } finally {
        setCarregando(false);
      }
    };

    carregarDados();
  }, [mes, ano, idSetor]);

  if (carregando) return <div className="kpi-card loading">Carregando ranking...</div>;
  if (erro) return <div className="kpi-card error">Erro: {erro}</div>;

  return (
    <div className="ranking-container">
      {/* Título da tela, fora do card */}

      <div className="ranking-card">
  {/* Cabeçalho do card */}
  <div className="card-header">
    <span className="card-emoji">🛠️</span>
    <span className="card-subtitle">Máquinas com mais ordens de serviço</span>
  </div>

  {dados.length === 0 ? (
    <p className="nenhum-dado">Nenhuma ordem encontrada no período.</p>
  ) : (
    <ul className="ranking-list">
      {dados.map((item, index) => (
        <li key={index} className="ranking-item">
          <span className="rank-index">{index + 1}º</span>
          <span className="rank-name">{item.maquina}</span>
          <span className="rank-value">{item.total_ordens} ordens</span>
        </li>
      ))}
    </ul>
  )}
</div>

    </div>
  );
}
