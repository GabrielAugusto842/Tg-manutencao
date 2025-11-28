import React, { useEffect, useState } from "react";
import Layout from "../../componentes/Layout/Layout";
import api from "../../Services/api.jsx";
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import "./Home.css";

function HomeManutentor() {
  const [minhasOS, setMinhasOS] = useState([]);
  const [graficoData, setGraficoData] = useState([]);

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      const usuario = JSON.parse(localStorage.getItem("usuario"));

      const response = await api.get(`/os/manutentor/${usuario.id_usuario}`);
      setMinhasOS(response.data);

      const estatisticas = {
        andamento: response.data.filter((os) => os.idEstado === 2).length,
        finalizadas: response.data.filter((os) => os.idEstado === 3).length,
        pendentes: response.data.filter((os) => os.idEstado === 1).length,
      };

      setGraficoData([
        { name: "Pendentes", valor: estatisticas.pendentes },
        { name: "Andamento", valor: estatisticas.andamento },
        { name: "Finalizadas", valor: estatisticas.finalizadas },
      ]);
    } catch (error) {
      console.error("Erro ao carregar OS do manutentor:", error);
    }
  };

  return (
    <Layout title="Home - Manutentor">
      <div className="home-manutentor-container">

        {/* CARDS */}
        <div className="cards-container">
          <div className="card-item">
            <h3>OS Pendentes</h3>
            <p className="numero">
              {minhasOS.filter((os) => os.idEstado === 1).length}
            </p>
          </div>

          <div className="card-item">
            <h3>OS em Andamento</h3>
            <p className="numero">
              {minhasOS.filter((os) => os.idEstado === 2).length}
            </p>
          </div>

          <div className="card-item">
            <h3>OS Finalizadas no Mês</h3>
            <p className="numero">
              {minhasOS.filter((os) => os.idEstado === 3).length}
            </p>
          </div>
        </div>

        {/* GRÁFICO */}
        <div className="grafico-container">
          <h3>Status das Minhas OS</h3>

          <BarChart width={500} height={250} data={graficoData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="valor" fill="#0077cc" />
          </BarChart>
        </div>
      </div>
    </Layout>
  );
}

export default HomeManutentor;
