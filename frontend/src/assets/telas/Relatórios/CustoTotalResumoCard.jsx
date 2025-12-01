import React, { useState, useEffect } from "react";
import "./DashboardGeral.css";

const API_URL = "http://localhost:3002/api/relatorios";
const CUSTO_META = 2000.0; // Definindo a meta de custo

// Função para determinar a cor com base no valor em relação à meta
const getCustoColor = (custoTotal, custoMeta) => {
  if (custoTotal >= custoMeta) {
    return "#cc1818ff"; // Vermelho, quando ultrapassa a meta
  }
  return "#0ebc0eff"; // Verde, quando está abaixo da meta
};

export default function CustoTotalGeralResumoCard({
  dataInicial,
  dataFinal,
  idSetor,
}) {
  const [custoTotal, setCustoTotal] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

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

    const buscarCustoTotal = async () => {
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

        const resposta = await fetchWithRetry(
          `${API_URL}/custo-total-geral${query}`,
          { headers }
        );
        if (!resposta.ok)
          throw new Error("Erro ao buscar custo total de manutenção");

        const dados = await resposta.json();
        setCustoTotal(dados?.custoTotal ?? 0);
      } catch (e) {
        console.error("Erro ao buscar Custo Total:", e);
        setErro(e.message);
      } finally {
        setCarregando(false);
      }
    };

    buscarCustoTotal();
  }, [dataInicial, dataFinal, idSetor]);

  if (carregando)
    return (
      <div className="kpi-card loading">
        <div className="spinner">🔄</div> Carregando Custo Total...
      </div>
    );

  if (erro)
    return (
      <div className="kpi-card error">
        <p className="error-message">Erro: {erro}</p>
      </div>
    );

  // Verifica a cor do custo com base na meta
  const custoColor = getCustoColor(custoTotal, CUSTO_META);

  return (
    <div className="kpi-card custo-total">
      <h4 className="card-titulo">Custo Total de Manutenção</h4>

      <div className="kpi-content centralizado">
        <div className="kpi-valor-principal">
          <span className="valor-indicador" style={{ color: custoColor }}>
            {custoTotal.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })}
          </span>

          <p className="card-meta">Total de Custos</p>
        </div>
      </div>

      {/* Meta abaixo do valor */}
      <p
        className="card-meta"
        style={{ textAlign: "center", marginTop: "8px" }}
      >
        Limite:{" "}
        {CUSTO_META.toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL",
        })}
      </p>
    </div>
  );
}
