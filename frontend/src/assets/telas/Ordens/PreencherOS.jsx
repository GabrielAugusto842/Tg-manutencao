import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "../../componentes/Layout/Layout";

const API_URL = "http://localhost:3002/api/os";

export default function PreencherOS() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [ordem, setOrdem] = useState(null);
  const [solucao, setSolucao] = useState("");
  const [custo, setCusto] = useState("");
  const [erro, setErro] = useState(null);
  const [mensagemSucesso, setMensagemSucesso] = useState(null);

  function formatarDataBrasil(dataString) {
    if (!dataString) return "-";

    const data = new Date(dataString);

    return data.toLocaleString("pt-BR", {
      timeZone: "America/Sao_Paulo",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  useEffect(() => {
    buscarOS();
  }, []);

  const buscarOS = async () => {
    try {
      const resposta = await fetch(`${API_URL}/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!resposta.ok) throw new Error("Erro ao buscar OS");

      const dados = await resposta.json();
      setOrdem(dados);
    } catch (e) {
      setErro("Erro ao carregar a O.S");
      console.error(e);
    }
  };

  const finalizarOrdem = async () => {
    if (!solucao.trim()) {
      setErro("A solução é obrigatória!");
      return;
    }

    try {
      const resposta = await fetch(`${API_URL}/finalizar/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          solucao,
          custo: custo || null,
        }),
      });

      const dados = await resposta.json();

      if (!resposta.ok) {
        setErro(dados.error || "Erro ao finalizar OS");
        return;
      }

      setMensagemSucesso("Ordem finalizada com sucesso!");
      setTimeout(() => navigate("/ordens/minhasos"), 1500);
    } catch (e) {
      console.error(e);
      setErro("Erro ao finalizar OS");
    }
  };

  if (!ordem) return <p>Carregando...</p>;

  return (
    <Layout title="Preencher Ordem de Serviço">
      <div className="container">
        <h2>Máquina: {ordem.nomeMaquina}</h2>

        {erro && <p style={{ color: "red" }}>{erro}</p>}
        {mensagemSucesso && <p style={{ color: "green" }}>{mensagemSucesso}</p>}

        <p>
          <strong>Descrição (Problema):</strong> {ordem.descricao}
        </p>
        <p>
          <strong>Data Abertura:</strong>{" "}
          {formatarDataBrasil(ordem.dataAbertura)}
        </p>

        <div style={{ marginTop: 20 }}>
          <label>Solução aplicada:</label>
          <textarea
            value={solucao}
            onChange={(e) => setSolucao(e.target.value)}
            rows={5}
            style={{ width: "100%", padding: 8 }}
          />
        </div>

        <div style={{ marginTop: 20 }}>
          <label>Custo (opcional):</label>
          <input
            type="number"
            value={custo}
            onChange={(e) => setCusto(e.target.value)}
            style={{ width: "100%", padding: 8 }}
          />
        </div>

        <button
          onClick={finalizarOrdem}
          style={{
            marginTop: 20,
            padding: "10px 20px",
            background: "green",
            color: "white",
            border: "none",
            cursor: "pointer",
            fontSize: 16,
          }}
        >
          Finalizar Ordem
        </button>
      </div>
    </Layout>
  );
}
