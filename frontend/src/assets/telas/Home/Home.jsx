import React, { useEffect, useState } from "react";
import Layout from "../../componentes/Layout/Layout";
import api from "../../Services/api.jsx";
import "./Home.css";

// Para usar ícones do FontAwesome, você pode importar a biblioteca
import { FaUserPlus, FaCogs, FaIndustry } from "react-icons/fa";

function Home() {
  const [totais, setTotais] = useState({
    abertas: 0,
    andamento: 0,
    finalizadas: 0,
  });
  const [usuario, setUsuario] = useState(null);
  const [quantidades, setQuantidades] = useState({
    usuarios: 0,
    maquinas: 0,
    setores: 0,
  });

  const nomeMes = new Date().toLocaleDateString("pt-BR", { month: "long" });

  useEffect(() => {
    const usuarioSalvo = JSON.parse(localStorage.getItem("user") || "null");
    setUsuario(usuarioSalvo);
    console.log("Usuário carregado:", usuarioSalvo);
  }, []);

  useEffect(() => {
    if (!usuario) return;

    const carregarDados = async () => {
      try {
        let url = "/os/dashboard";
        // Se for manutentor, filtra pela ID do usuário
        if (usuario.cargo === "Manutentor") {
          url += `?id_usuario=${usuario.id_usuario}`;
        }

        // Se for gerente, pega todas as O.S. do mês atual
        if (usuario.cargo === "Gerente de Manutenção") {
          // Filtra por mês atual. Ajuste a URL conforme necessário para sua API.
          const mesAtual = new Date().getMonth() + 1; // Janeiro = 1, Dezembro = 12
          const anoAtual = new Date().getFullYear();
          url += `?mes=${mesAtual}&ano=${anoAtual}`;
        }

        const resp = await api.get(url);
        setTotais(resp.data);

        // Carrega as quantidades para Administrador e Gerente
        if (
          usuario.cargo === "Administrador" ||
          usuario.cargo === "Gerente de Manutenção"
        ) {
          const resUsuarios = await api.get("/user");
          const resMaquinas = await api.get("/maquina");
          const resSetores = await api.get("/setores");

          setQuantidades({
            usuarios: resUsuarios.data.length,
            maquinas: resMaquinas.data.length,
            setores: resSetores.data.length,
          });
        }
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
    <Layout title="Bem-vindo ao Maintenance Manager">
      <div className="home-container" id="print-area">
        <h2 className="tituloSecao">
          {usuario.cargo === "Manutentor"
            ? `Olá, ${usuario.nome}! Suas Ordens de ${mesFormatado}`
            : usuario.cargo === "Gerente de Manutenção" ||
              usuario.cargo === "Operador"
            ? `Olá, ${usuario.nome}! Ordens de Serviço de ${mesFormatado}`
            : `Olá, ${usuario.nome}!`}
        </h2>

        {/* Cards para Administrador e Gerente */}
        {usuario.cargo === "Administrador" && (
          <div className="cards-container">
            <div className="card card-admin card-usuarios">
              <div className="card-content">
                <div className="card-title">
                  <FaUserPlus className="card-icon" />
                  <h3> Novo Usuário</h3>
                </div>
                <p className="quantidade">
                  {quantidades.usuarios} Usuários cadastrados
                </p>
              </div>
            </div>

            <div className="card card-admin card-maquinas">
              <div className="card-content">
                <div className="card-title">
                  <FaCogs className="card-icon" />
                  <h3> Nova Máquina</h3>
                </div>
                <p className="quantidade">
                  {quantidades.maquinas} Máquinas cadastradas
                </p>
              </div>
            </div>

            <div className="card card-admin card-setores">
              <div className="card-content">
                <div className="card-title">
                  <FaIndustry className="card-icon" />
                  <h3> Novo Setor</h3>
                </div>
                <p className="quantidade">
                  {quantidades.setores} Setores cadastrados
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Cards para Manutentor e Gerente de Manutenção */}
        {(usuario.cargo === "Manutentor" ||
          usuario.cargo === "Gerente de Manutenção" ||
          usuario.cargo === "Operador") && (
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
        )}
      </div>
    </Layout>
  );
}

export default Home;
