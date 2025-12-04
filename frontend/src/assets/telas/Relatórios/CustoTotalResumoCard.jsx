import React, { useState, useEffect } from "react";
import "./DashboardGeral.css";

const API_URL = "http://localhost:3002/api/relatorios";

export default function CustoTotalGeralResumoCard({ mes, ano, idSetor }) {
  const [custoTotal, setCustoTotal] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  // Meta salva no navegador
  const [metaCusto, setMetaCusto] = useState(
    Number(localStorage.getItem("metaCusto")) || 2000
  );

  // Cor baseada na meta definida pelo usuário
  const getCustoColor = (valor, meta) => {
    return valor >= meta ? "#cc1818ff" : "#0ebc0eff";
  };

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
      throw new Error("Falha ao buscar dados.");
    };

    const buscar = async () => {
      setCarregando(true);
      try {
        const params = new URLSearchParams();
        if (mes) params.append("mes", mes);
        if (ano) params.append("ano", ano);
        if (idSetor) params.append("idSetor", idSetor);

        const headers = {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        };

        const resp = await fetchWithRetry(
          `${API_URL}/custo-total-geral?${params.toString()}`,
          { headers }
        );

        const dados = await resp.json();
        setCustoTotal(dados?.custoTotal ?? 0);
      } catch (e) {
        setErro(e.message);
      } finally {
        setCarregando(false);
      }
    };

    buscar();
  }, [mes, ano, idSetor]);

  function alterarMeta(e) {
    const novoValor = Number(e.target.value);
    setMetaCusto(novoValor);
    localStorage.setItem("metaCusto", novoValor);
  }

  if (carregando)
    return <div className="kpi-card loading">Carregando...</div>;

  if (erro)
    return <div className="kpi-card error">Erro: {erro}</div>;

  return (
    <div className="kpi-card custo-total">
      <h4 className="card-titulo">Custo Total de Manutenção</h4>

      <div className="kpi-content centralizado">
        <span
          className="valor-indicador"
          style={{ color: getCustoColor(custoTotal, metaCusto) }}
        >
          {custoTotal.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          })}
        </span>

        <p className="card-meta ">Total de Custos </p>
      </div>

      {/* Campo de meta igual aos outros cards */}
      <div className="custo-meta-container-inline">
        <label>Limite:</label>
        <div className="input-time-card">
          <input
            type="number"
            min="0"
            value={metaCusto}
            onChange={alterarMeta}
          />
          <span>R$</span>
        </div>
      </div>
    </div>
  );
}
