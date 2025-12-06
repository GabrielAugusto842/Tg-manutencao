import React, { useState, useEffect } from "react";
import "./RankingStyles.css";
import api from "../../Services/api.jsx";

export default function RankingUsuariosCustos({ mes, ano, idSetor }) {
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
        if (idSetor) params.idSetor = idSetor;

        const resp = await api.get("/relatorios/ranking/usuarios-custos", {
          params: params,
        });

        const dadosApi = resp.data;
        setDados(dadosApi);
      } catch (e) {
        console.error("Erro ao carregar ranking de usuários:", e);
        setErro(e.message || "Falha desconhecida ao buscar dados.");
      } finally {
        setCarregando(false);
      }
    };

    carregarDados();
  }, [mes, ano, idSetor]);

  if (carregando)
    return <div className="kpi-card loading">Carregando ranking...</div>;
  if (erro) return <div className="kpi-card error">Erro: {erro}</div>;

  return (
    <div className="ranking-card">
      <div className="card-header">
        <span className="card-emoji">💰</span>
        <span className="card-subtitle">Manutentores com mais custos</span>
      </div>

      {dados.length === 0 ? (
        <p className="nenhum-dado">Nenhuma ordem registrada no período.</p>
      ) : (
        <ul className="ranking-list">
          {dados.map((item, index) => (
            <li key={index} className="ranking-item">
              <span className="rank-index">{index + 1}º</span>
              <span className="rank-name">{item.nomeUsuario}</span>
              <span className="rank-value">
                R$ {item.totalCusto.toFixed(2)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
