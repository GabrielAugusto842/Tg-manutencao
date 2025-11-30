import React, { useState, useEffect } from "react";
import { formatHoras, getMtbfColor } from "../../Services/formatters"; // Assumindo que você moverá as funções formatadoras
import "./DashboardGeral.css"; // Estilos compartilhados
import DashboardMTBF from "./DashboardMTBF.jsx";

const API_URL = "http://localhost:3002/api/relatorios";
const MTBF_META_HORAS = 200.0; // Meta alta

// 🎯 1. RECEBE idSetor NAS PROPS
export default function MtbfResumoCard({ dataInicial, dataFinal, idSetor }) {
  const [mtbfGeral, setMtbfGeral] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    // Lógica de fetch simplificada apenas para o MTBF Geral
    const buscarMTBF = async () => {
      setCarregando(true);
      setErro(null);
      try {
        const params = new URLSearchParams();
        if (dataInicial) params.append("dataInicial", dataInicial);
        if (dataFinal) params.append("dataFinal", dataFinal);

        // 🎯 2. ADICIONA idSetor AOS PARÂMETROS DE CONSULTA
        if (idSetor) params.append("idSetor", idSetor);

        const query = params.toString() ? `?${params.toString()}` : "";
        const headers = {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        };

        const respostaGeral = await fetch(`${API_URL}/mtbf-geral${query}`, {
          headers,
        });

        if (!respostaGeral.ok) throw new Error("Erro ao buscar MTBF geral");
        const dadosGeral = await respostaGeral.json();
        setMtbfGeral(dadosGeral?.mtbf ?? 0);
      } catch (e) {
        setErro(e.message);
      } finally {
        setCarregando(false);
      }
    };
    buscarMTBF(); // 🎯 3. INCLUI idSetor NO ARRAY DE DEPENDÊNCIAS
  }, [dataInicial, dataFinal, idSetor]);

  if (carregando)
    return <div className="kpi-card loading">Carregando MTBF...</div>;
  if (erro) return <div className="kpi-card error">Erro: {erro}</div>;

  return (
    <div className="kpi-card mtbf">
      <h4 className="card-titulo">MTBF Geral no Período</h4>{" "}
      <div className="kpi-content">
        {" "}
        <div className="kpi-valor-principal">
          {" "}
          <span
            className="valor-indicador"
            style={{ color: getMtbfColor(mtbfGeral, MTBF_META_HORAS) }} // Use a cor condicional
          >
            {formatHoras(mtbfGeral)}{" "}
          </span>{" "}
          <p className="card-meta">Meta: {formatHoras(MTBF_META_HORAS)}</p>{" "}
        </div>{" "}
        <div className="kpi-grafico-rosca">
          <DashboardMTBF mtbfValue={mtbfGeral} />{" "}
        </div>{" "}
      </div>{" "}
    </div>
  );
}
