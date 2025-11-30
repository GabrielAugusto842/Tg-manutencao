import React, { useState, useEffect } from "react";
import Layout from "../../componentes/Layout/Layout";
import DashboardGeral from "./DashboardGeral.jsx";
import "./Relatorios.css";

// URL da sua API (Adapte conforme necessário)
const API_URL = "http://localhost:3002/api/setores";

export default function Relatorios() {
  // 1. Estados para os filtros de Data
  const [dataInicial, setDataInicial] = useState("");
  const [dataFinal, setDataFinal] = useState("");

  // 2. Novo estado para o Setor
  const [idSetorSelecionado, setIdSetorSelecionado] = useState("");

  // 3. Estado para armazenar a lista de setores
  const [setores, setSetores] = useState([]);
  const [carregandoSetores, setCarregandoSetores] = useState(true);

  // Lógica para buscar os setores na montagem do componente
  useEffect(() => {
    const buscarSetores = async () => {
      try {
        // Supondo que a API retorne a lista de setores
        const response = await fetch(API_URL, {
          headers: {
            // Inclua a autorização, se necessário
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (!response.ok) {
          throw new Error("Falha ao carregar a lista de setores.");
        }

        const data = await response.json();

        // Assumindo que a API retorna um array de objetos { idSetor: number, nomeSetor: string }
        setSetores(data);
      } catch (error) {
        console.error("Erro ao buscar setores:", error);
        // Você pode querer exibir um erro na tela
      } finally {
        setCarregandoSetores(false);
      }
    };

    buscarSetores();
  }, []); // Executa apenas uma vez na montagem

  return (
    <Layout title="Relatórios">
      <div className="relatorios-page-container">
        <header className="relatorios-header">
          <div className="relatorios-actions">
            {/* futuros botões: exportar, filtros salvos, etc. */}
          </div>
        </header>

        {/* Container de Filtros */}
        <div className="relatorios-filtros-container">
          {/* Filtro Data Inicial */}
          <div className="filtro-grupo">
            <label>Data Inicial</label>
            <input
              type="date"
              value={dataInicial}
              onChange={(e) => setDataInicial(e.target.value)}
              className="filtro-input"
            />
          </div>

          {/* Filtro Data Final */}
          <div className="filtro-grupo">
            <label>Data Final</label>
            <input
              type="date"
              value={dataFinal}
              onChange={(e) => setDataFinal(e.target.value)}
              className="filtro-input"
            />
          </div>

          {/* 🎯 NOVO FILTRO: Setor */}
          <div className="filtro-grupo">
            <label>Filtrar por Setor</label>
            <select
              value={idSetorSelecionado}
              onChange={(e) => setIdSetorSelecionado(e.target.value)}
              className="filtro-input"
              disabled={carregandoSetores}
            >
              <option value="">Todos os Setores</option>
              {/* Renderiza a lista de setores */}
              {setores.length > 0 ? (
                setores.map((setor) => (
                  <option key={setor.idSetor} value={setor.idSetor}>
                    {setor.nomeSetor}
                  </option>
                ))
              ) : (
                <option disabled>
                  {carregandoSetores
                    ? "Carregando..."
                    : "Nenhum setor encontrado"}
                </option>
              )}
            </select>
          </div>
          {/* Fim do Novo Filtro */}
        </div>

        <main className="relatorio-display-area">
          {/* 4. Passa o idSetorSelecionado como prop para o DashboardGeral */}
          <DashboardGeral
            dataInicial={dataInicial}
            dataFinal={dataFinal}
            idSetor={idSetorSelecionado} // Propriedade chave para o filtro
          />
        </main>
      </div>
    </Layout>
  );
}
