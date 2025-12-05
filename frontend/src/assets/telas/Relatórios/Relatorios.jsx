import React, { useState, useEffect } from "react";
import Layout from "../../componentes/Layout/Layout";
import DashboardGeral from "./DashboardGeral.jsx";
import DashboardRanking from "./DashboardRanking.jsx";
import "./Relatorios.css";
import DashboardMaquinas from "./DashboardMaquinas.jsx";

const API_URL = "http://localhost:3002/api/setores";

export default function Relatorios() {
  const [mes, setMes] = useState("");
  const [ano, setAno] = useState("");
  const [tipoRelatorio, setTipoRelatorio] = useState("dashboard-geral");
  const [idSetorSelecionado, setIdSetorSelecionado] = useState("");
  const [setores, setSetores] = useState([]);
  const [carregandoSetores, setCarregandoSetores] = useState(true);

  // Carrega setores
  useEffect(() => {
    const buscarSetores = async () => {
      try {
        const response = await fetch(API_URL, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        if (!response.ok) throw new Error("Falha ao carregar setores.");
        const data = await response.json();
        setSetores(data);
      } catch (error) {
        console.error("Erro ao buscar setores:", error);
      } finally {
        setCarregandoSetores(false);
      }
    };
    buscarSetores();
  }, []);

  const anoAtual = new Date().getFullYear();

  return (
    <Layout title="Relatórios">
      <div className="relatorios-page-container">
        <header className="relatorios-header">
          <div className="relatorios-actions"></div>
        </header>

        {/* FILTROS */}
        <div className="relatorios-filtros-container">
          {/* Mês */}
          <div className="filtro-grupo">
            <label>Mês</label>
            <select
              value={mes}
              onChange={(e) => setMes(e.target.value)}
              className="filtro-input"
            >
              <option value="">Todos</option>
              {[...Array(12)].map((_, i) => (
                <option key={i + 1} value={i + 1}>
                  {new Date(0, i).toLocaleString("pt-BR", { month: "long" })}
                </option>
              ))}
            </select>
          </div>

          {/* Ano */}
          <div className="filtro-grupo">
            <label>Ano</label>
            <input
              type="number"
              value={ano}
              onChange={(e) => setAno(e.target.value)}
              className="filtro-input"
              placeholder={anoAtual.toString()}
              min="2000"
              max="2100"
            />
          </div>

          {/* Tipo de relatório */}
          <div className="filtro-grupo">
            <label>Tipo de Relatório</label>
            <select
              value={tipoRelatorio}
              onChange={(e) => setTipoRelatorio(e.target.value)}
              className="filtro-input"
            >
              <option value="dashboard-geral">
                Dashboard - Métricas Gerais
              </option>
              <option value="ranking">Ranking de Ordens</option>
              <option value="dashboard-maquinas"> Métricas por Máquinas</option>
            </select>
          </div>

          {/* Setor */}
          <div className="filtro-grupo">
            <label>Setor</label>
            <select
              value={idSetorSelecionado}
              onChange={(e) => setIdSetorSelecionado(e.target.value)}
              className="filtro-input"
              disabled={carregandoSetores}
            >
              <option value="">Todos os Setores</option>
              {setores.length > 0 ? (
                setores.map((setor) => (
                  <option key={setor.idSetor} value={setor.idSetor}>
                    {setor.nomeSetor}
                  </option>
                ))
              ) : (
                <option disabled>
                  {carregandoSetores ? "Carregando..." : "Nenhum setor"}
                </option>
              )}
            </select>
          </div>
        </div>

        {/* RELATÓRIO */}
        <main className="relatorio-display-area">
          {tipoRelatorio === "dashboard-geral" && (
            <DashboardGeral mes={mes} ano={ano} idSetor={idSetorSelecionado} />
          )}
          {tipoRelatorio === "ranking" && (
            <DashboardRanking
              mes={mes}
              ano={ano}
              idSetor={idSetorSelecionado}
            />
          )}
        </main>

        {tipoRelatorio === "dashboard-maquinas" && (
          <DashboardMaquinas mes={mes} ano={ano} idSetor={idSetorSelecionado} />
        )}
      </div>
    </Layout>
  );
}
