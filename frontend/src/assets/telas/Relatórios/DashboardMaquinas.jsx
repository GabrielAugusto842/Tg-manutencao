import React, { useEffect, useState } from "react";
import MttrResumoCard from "./MttrResumoCard.jsx";
import MtbfResumoCard from "./MtbfResumoCard.jsx";
import MttaResumoCard from "./MttaResumoCard.jsx";
import CustoTotalResumoCard from "./CustoTotalResumoCard.jsx";
import "./DashboardGeral.css";
import "./DashboardMaquina.css";
import MttrMaquinaResumoCard from "./MttrMaquinaResumoCard.jsx";
import MtbfMaquinaResumoCard from "./MtbfMaquinaResumoCard.jsx";
import MttaMaquinaResumoCard from "./MttaMaquinaResumoCard.jsx";
import CustoMaquinaResumoCard from "./CustoMaquinaResumoCard.jsx";

const API_URL = "http://localhost:3002/api/maquina";

export default function DashboardMaquinas({ mes, ano, idSetor }) {
  const [maquinas, setMaquinas] = useState([]);
  const [loading, setLoading] = useState(true);

  // Carrega todas as máquinas
  useEffect(() => {
    const buscarMaquinas = async () => {
      try {
        const resp = await fetch(API_URL, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        const data = await resp.json();
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

  return (
    <div className="w-full px-4 py-6">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800">
        🏭 Indicadores por Máquina
      </h2>

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
                mostrarTitulo={false}
              />

              <MtbfMaquinaResumoCard
                mes={mes}
                ano={ano}
                idSetor={idSetor}
                idMaquina={maq.idMaquina}
                mostrarTitulo={false}
              />

              <MttaMaquinaResumoCard
                mes={mes}
                ano={ano}
                idSetor={idSetor}
                idMaquina={maq.idMaquina}
                mostrarTitulo={false}
              />

              <CustoMaquinaResumoCard
                mes={mes}
                ano={ano}
                idSetor={idSetor}
                idMaquina={maq.idMaquina}
                mostrarTitulo={false}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
