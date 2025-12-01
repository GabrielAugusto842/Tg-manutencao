import React, { useState, useEffect } from "react";
// CORREÇÃO: Ajustando o caminho do import
import { formatHoras, getMtbfColor } from "../../Services/formatters";
import "./DashboardGeral.css";
import DashboardMTBF from "./DashboardMTBF.jsx";

const API_URL = "http://localhost:3002/api/relatorios";

// RECEBE PROPS DE META
export default function MtbfResumoCard({
  dataInicial,
  dataFinal,
  idSetor,
  // NOVAS PROPS DE ENTRADA H/M para MTBF (valores inteiros)
  metaMtbfHoras,
  setMetaMtbfHoras,
  metaMtbfMinutos,
  setMetaMtbfMinutos,
  // Prop do valor total da meta (decimal) calculado pelo DashboardGeral
  metaMTBF,
}) {
  const [mtbfGeral, setMtbfGeral] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  // Usa o valor da meta recebido por prop (200.0 se for nulo)
  const meta = metaMTBF || 200;

  useEffect(() => {
    const buscarMTBF = async () => {
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
    buscarMTBF();
  }, [dataInicial, dataFinal, idSetor]);

  // Manipuladores de alteração para Meta MTBF
  const handleMetaHorasChange = (e) => {
    // Garante que o valor não é negativo
    setMetaMtbfHoras(Math.max(0, Number(e.target.value)));
  };

  const handleMetaMinutosChange = (e) => {
    // Garante que o valor está entre 0 e 59
    setMetaMtbfMinutos(Math.min(59, Math.max(0, Number(e.target.value))));
  };

  if (carregando)
    return <div className="kpi-card loading">Carregando MTBF...</div>;
  if (erro) return <div className="kpi-card error">Erro: {erro}</div>;

  return (
    <div className="kpi-card mtbf">
      <h4 className="card-titulo">MTBF Geral no Período</h4>
      <div className="kpi-content">
        <div className="kpi-valor-principal">
          <span
            className="valor-indicador"
            style={{ color: getMtbfColor(mtbfGeral, meta) }}
          >
            {formatHoras(mtbfGeral)}
          </span>
          <p className="card-meta">Meta (Acima de): {formatHoras(meta)}</p>
        </div>
        <div className="kpi-grafico-rosca">
          {/* Passa o valor da meta em decimal para o gráfico */}
          <DashboardMTBF mtbfValue={mtbfGeral} valorMeta={meta} />
        </div>
      </div>

      {/* CAMPOS DE INPUT PARA DEFINIR A META MTBF */}
      <div className="mttb-meta-container-inline no-print">
        <label className="font-semibold mr-2">Definir Meta:</label>

        <div className="input-time-card">
          <input
            type="number"
            value={metaMtbfHoras}
            onChange={handleMetaHorasChange}
            min={0}
          />
          <span>h</span>
        </div>

        <div className="input-time-card">
          <input
            type="number"
            value={metaMtbfMinutos}
            onChange={handleMetaMinutosChange}
            min={0}
            max={59}
          />
          <span>min</span>
        </div>
      </div>
    </div>
  );
}
