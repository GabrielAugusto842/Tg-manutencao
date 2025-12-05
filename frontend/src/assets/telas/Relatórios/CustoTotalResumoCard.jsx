import React, { useState, useEffect } from "react";
import "./DashboardGeral.css";

const API_URL = "http://localhost:3002/api/relatorios";

export default function CustoTotalResumoCard({
  mes,
  ano,
  idSetor,
  onDataFetched,
}) {
  const [custoTotal, setCustoTotal] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  const [metaCusto, setMetaCusto] = useState(
    Number(localStorage.getItem("metaCusto")) || 2000
  );

  const getCustoColor = (valor, meta) =>
    valor >= meta ? "#cc1818ff" : "#0ebc0eff";

  useEffect(() => {
    const fetchCusto = async () => {
      setCarregando(true);
      setErro(null);

      try {
        const params = new URLSearchParams();
        if (mes) params.append("mes", mes);
        if (ano) params.append("ano", ano);
        if (idSetor) params.append("idSetor", idSetor);

        const resp = await fetch(
          `${API_URL}/custo-total-geral?${params.toString()}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (!resp.ok) throw new Error("Erro ao buscar custo total");

        const dados = await resp.json();
        setCustoTotal(dados.custoTotal ?? 0);

        if (onDataFetched) {
          onDataFetched({
            indicador: "Custo Total",
            valor: dados.custoTotal ?? null,
            aviso: "",
            meta: metaCusto,
          });
        }
      } catch (e) {
        setErro(e.message);
      } finally {
        setCarregando(false);
      }
    };

    fetchCusto();
  }, [mes, ano, idSetor, metaCusto]);

  const alterarMeta = (e) => {
    const novoValor = Number(e.target.value);
    setMetaCusto(novoValor);
    localStorage.setItem("metaCusto", novoValor);
  };

  if (carregando) return <div className="kpi-card loading">Carregando...</div>;
  if (erro) return <div className="kpi-card error">Erro: {erro}</div>;

  return (
    <div className="kpi-card custo-total">
      <h4 className="card-titulo">Custo Total de Manutenção</h4>
      <div className="kpi-content centralizado">
        <span style={{ color: getCustoColor(custoTotal, metaCusto) }}>
          {custoTotal.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          })}
        </span>
        <p className="card-meta">Total de Custos</p>
      </div>

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
