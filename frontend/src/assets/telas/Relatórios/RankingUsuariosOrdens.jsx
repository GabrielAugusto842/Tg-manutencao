import React, { useState, useEffect } from "react";
import "./RankingStyles.css";

const API_URL = "http://localhost:3002/api/relatorios";

export default function RankingUsuariosOrdens({ mes, ano, idSetor }) {
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

        const query = params.toString() ? `?${params.toString()}` : "";
        const resp = await fetch(`${API_URL}/ranking/usuarios-ordens${query}`, {
          headers: { "Content-Type": "application/json" },
        });

        if (!resp.ok) throw new Error("Erro ao buscar ranking de usuários por ordens.");

        const dadosApi = await resp.json();
        setDados(dadosApi);
      } catch (e) {
        console.error("Erro ao carregar ranking de usuários:", e);
        setErro(e.message || "Falha desconhecida ao buscar dados.");
      } finally {
        setCarregando(false);
      }
    };

    carregarDados();
  }, [mes, ano]);

  if (carregando) return <div className="kpi-card loading">Carregando ranking...</div>;
  if (erro) return <div className="kpi-card error">Erro: {erro}</div>;

  return (
    <div className="ranking-card">
      <div className="card-header">
        <span className="card-emoji">🛠️</span>
        <span className="card-subtitle">Manutentores com mais ordens</span>
      </div>

      {dados.length === 0 ? (
        <p className="nenhum-dado">Nenhuma ordem registrada no período.</p>
      ) : (
        <ul className="ranking-list">
          {dados.map((item, index) => (
            <li key={index} className="ranking-item">
              <span className="rank-index">{index + 1}º</span>
              <span className="rank-name">{item.nomeUsuario}</span>
              <span className="rank-value">{item.totalOrdens}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
