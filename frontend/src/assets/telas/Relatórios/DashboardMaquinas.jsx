import React, { useEffect, useState, useCallback } from "react";
import "./DashboardGeral.css";
import "./DashboardMaquina.css";
import MttrMaquinaResumoCard from "./MttrMaquinaResumoCard.jsx";
import MtbfMaquinaResumoCard from "./MtbfMaquinaResumoCard.jsx";
import MttaMaquinaResumoCard from "./MttaMaquinaResumoCard.jsx";
import CustoMaquinaResumoCard from "./CustoMaquinaResumoCard.jsx";
import api from "../../Services/api.jsx";

export default function DashboardMaquinas({ mes, ano, idSetor, exportPDF }) {
  const [maquinas, setMaquinas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [metricas, setMetricas] = useState({});

  const atualizarMetricas = useCallback(
    (tipo, idMaquina, valor) => {
      setMetricas((prev) => ({
        ...prev,
        [idMaquina]: {
          ...prev[idMaquina],
          [tipo]: valor,
        },
      }));
    },
    [setMetricas]
  );

  // Carrega todas as máquinas
  useEffect(() => {
    const buscarMaquinas = async () => {
      try {
        const resp = await api.get("/maquina");

        const data = resp.data
        setMaquinas(data);
        console.log("Máquinas recebidas:", data);
      } catch (err) {
        console.error("Erro ao buscar máquinas:", err);
      } finally {
        setLoading(false);
      }
    };

    buscarMaquinas();
  }, []);

  if (loading) return <p>Carregando máquinas...</p>;

  function exportarCSV() {
    let linhas = [];
    linhas.push("Maquina;MTTR;MTBF;MTTA;Custo");

    maquinas.forEach((maq) => {
      const m = metricas[maq.idMaquina] || {};

      linhas.push(
        `${maq.nome};` +
          `${((m.MTTR ?? 0) / 60).toFixed(2)};` +
          `${((m.MTBF ?? 0) / 60).toFixed(2)};` +
          `${((m.MTTA ?? 0) / 60).toFixed(2)};` +
          `${(m.Custo ?? 0).toFixed(2)}`
      );
    });

    const csvContent = linhas.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "metricas_por_maquina.csv";
    link.click();
  }

  return (
    <div className="w-full px-4 py-6">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800">
        🏭 Indicadores por Máquina
      </h2>

      <div className="mb-6">
        <button onClick={exportPDF} className="botao-pdf-relatorio">
          📄 Exportar PDF
        </button>
      </div>

      <button onClick={exportarCSV} className="botao-exportar">
        📄 Exportar CSV
      </button>

      <div className="lista-maquinas">
        {maquinas.map((maq) => (
          <div key={maq.idMaquina} className="maquina-card-container">
            <div className="maquina-header">
              <h3 className="titulo-maquina">{maq.nome}</h3>
            </div>

            <div className="dashboard-kpi-grid-maquinas">
              <MttrMaquinaResumoCard
                mes={mes}
                ano={ano}
                idSetor={idSetor}
                idMaquina={maq.idMaquina}
                onValorCarregado={atualizarMetricas}
              />

              <MtbfMaquinaResumoCard
                mes={mes}
                ano={ano}
                idSetor={idSetor}
                idMaquina={maq.idMaquina}
                mostrarTitulo={false}
                onValorCarregado={atualizarMetricas}
              />

              <MttaMaquinaResumoCard
                mes={mes}
                ano={ano}
                idSetor={idSetor}
                idMaquina={maq.idMaquina}
                mostrarTitulo={false}
                onValorCarregado={atualizarMetricas}
              />

              <CustoMaquinaResumoCard
                mes={mes}
                ano={ano}
                idSetor={idSetor}
                idMaquina={maq.idMaquina}
                mostrarTitulo={false}
                onValorCarregado={atualizarMetricas}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
