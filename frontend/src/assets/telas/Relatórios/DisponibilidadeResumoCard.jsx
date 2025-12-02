import React, { useState, useEffect } from "react";
import "./DashboardGeral.css";
import DashboardDisponibilidade from "./DashboardDisponibilidade.jsx";

const API_URL = "http://localhost:3002/api/relatorios";

// RECEBE PROPS DE META
export default function DisponibilidadeResumoCard({
  dataInicial,
  dataFinal,
  idSetor,
  // NOVAS PROPS para Meta de Disponibilidade (%)
  metaDisponibilidade,
  setMetaDisponibilidade,
}) {
  const [disponibilidade, setDisponibilidade] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  // Usa o valor da meta recebido por prop (95.0% se for nulo)
  const meta = metaDisponibilidade ?? 95.0;

  // Lógica de retry (mantida do arquivo original)
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

    const buscarDisponibilidade = async () => {
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
          `${API_URL}/disponibilidade-geral${query}`,
          { headers }
        );
        if (!resposta.ok)
          throw new Error("Erro ao buscar Disponibilidade geral");

        const dados = await resposta.json();
        setDisponibilidade(dados?.disponibilidade ?? 0);
      } catch (e) {
        console.error("Erro ao buscar Disponibilidade:", e);
        setErro(e.message);
      } finally {
        setCarregando(false);
      }
    };

    buscarDisponibilidade();
  }, [dataInicial, dataFinal, idSetor]);

  // Manipulador de alteração para Meta Disponibilidade
  const handleMetaChange = (e) => {
    // Garante que o valor está entre 0 e 100 e permite décimos (step=0.1)
    const valor = Number(e.target.value);
    setMetaDisponibilidade(Math.min(100, Math.max(0, valor)));
  };

  if (carregando)
    return (
      <div className="kpi-card loading">Carregando Disponibilidade...</div>
    );
  if (erro) return <div className="kpi-card error">Erro: {erro}</div>;

  return (
    <div className="kpi-card disponibilidade">
      <h4 className="card-titulo">Disponibilidade Geral (%)</h4>

      {/* Rosca */}
      <div className="kpi-content kpi-disponibilidade-visual">
        <DashboardDisponibilidade valor={disponibilidade} meta={meta} />
      </div>

      {/* Meta abaixo da rosca */}
      <p
        className="card-meta"
        style={{ textAlign: "center", marginTop: "7px" }}
      >
        Meta: {meta}%
      </p>

      <p
        className="card-meta"
        style={{ textAlign: "center", marginTop: "1px" }}
      >
        Tempo Operacional
      </p>

      {/* CAMPOS DE INPUT PARA DEFINIR A META DE DISPONIBILIDADE */}
      <div
        className="mttr-meta-container-inline no-print"
        style={{ marginTop: "0px" }}
      >
        <label className="font-semibold mr-2">Definir Meta:</label>

        <div className="input-time-card">
          <input
            type="number"
            value={metaDisponibilidade}
            onChange={handleMetaChange}
            min={0}
            max={100}
            step={0.1} // Permite valores decimais (ex: 95.5)
            style={{ width: "40px" }} // Ajusta a largura
          />
          <span>%</span>
        </div>
      </div>
    </div>
  );
}
