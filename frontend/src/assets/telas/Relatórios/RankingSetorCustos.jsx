import React, { useState, useEffect } from "react";
import "./RankingStyles.css";
import api from "../../Services/api.jsx";

export default function RankingSetorCustos({ mes, ano }) {
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

        const resp = await api.get("/relatorios/ranking/setores-custos", {
          params: params, // Headers de autenticação e Content-Type são tratados pelo interceptor do Axios
        }); // 🚀 CORREÇÃO 2: Acessa os dados diretamente de resp.data

        const dadosApi = resp.data;
        setDados(dadosApi);
      } catch (e) {
        console.error("Erro ao carregar ranking de setores por custo:", e);
        setErro(e.message || "Falha desconhecida ao buscar dados.");
      } finally {
        setCarregando(false);
      }
    };

    carregarDados();
  }, [mes, ano]);

  if (carregando)
    return <div className="kpi-card loading">Carregando ranking...</div>;
  if (erro) return <div className="kpi-card error">Erro: {erro}</div>;

  return (
    <div className="ranking-card">
      <div className="card-header">
        <span className="card-emoji">💰</span>
        <span className="card-subtitle">Setores com maiores custos</span>
      </div>

      {dados.length === 0 ? (
        <p className="nenhum-dado">Nenhum custo registrado no período.</p>
      ) : (
        <ul className="ranking-list">
          {dados.map((item, index) => (
            <li key={index} className="ranking-item">
              <span className="rank-index">{index + 1}º</span>
              <span className="rank-name">{item.nomeSetor}</span>
              <span className="rank-value">
                R${" "}
                {item.totalCusto.toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
