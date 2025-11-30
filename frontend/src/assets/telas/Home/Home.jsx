import React, { useEffect, useState } from "react";
import Layout from "../../componentes/Layout/Layout";
import api from "../../Services/api.jsx";
import "./Home.css";

function Home() {
  const [totais, setTotais] = useState({
    abertas: 0,
    andamento: 0,
    finalizadas: 0,
  });
  const [usuario, setUsuario] = useState(null);

  const nomeMes = new Date().toLocaleDateString("pt-BR", { month: "long" });

  // Pega usuário diretamente do localStorage
  useEffect(() => {
    const usuarioSalvo = JSON.parse(localStorage.getItem("user") || "null");
    setUsuario(usuarioSalvo);
    console.log("Usuário carregado:", usuarioSalvo);
  }, []);

  // Carrega os dados do dashboard
  useEffect(() => {
    if (!usuario) return;

    const carregarDados = async () => {
      try {
        let url = "/os/dashboard";
        // Se for manutentor, passa id_usuario na query
        if (usuario.cargo === "Manutentor") {
          url += `?id_usuario=${usuario.id_usuario}`;
        }

        const resp = await api.get(url);
        setTotais(resp.data);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      }
    };

    carregarDados();
  }, [usuario]);

  if (!usuario) {
    return (
      <div style={{ textAlign: "center", marginTop: "50px" }}>
        Carregando...
      </div>
    );
  }

  const formatarMes = (mes) => {
    return mes.charAt(0).toUpperCase() + mes.slice(1);
  };

  const mesFormatado = formatarMes(nomeMes);

  return (
    <Layout title="Bem vindo ao Maintenance Manager">
      <div className="home-container" id="print-area">
        <h2 className="tituloSecao">
          {usuario.cargo.toUpperCase() === "MANUTENTOR"
            ? `Minhas Ordens de ${mesFormatado}`
            : `Ordens de serviços gerais - ${mesFormatado}`}{" "}
        </h2>
        <div className="tabela-wrapper no-print">
          <button onClick={() => window.print()} > 
            📄📥 Exportar para PDF
          </button>
        </div>     
        <br/>
        <div className="cards-container">
          <div className="card card-abertas">
            <h3>Abertas</h3>
            <p>{totais.abertas}</p>
          </div>

          <div className="card card-andamento">
            <h3>Em Andamento</h3>
            <p>{totais.andamento}</p>
          </div>

          <div className="card card-finalizadas">
            <h3>Finalizadas</h3>
            <p>{totais.finalizadas}</p>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default Home;
