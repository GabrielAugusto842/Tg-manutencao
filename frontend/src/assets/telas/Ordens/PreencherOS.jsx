import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "../../componentes/Layout/Layout";
import "./PreencherOS.css";


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
      <div className="preencher-os-container">
  <h2>Máquina: {ordem.nomeMaquina}</h2>

  <p>
    <strong>Descrição (Problema):</strong> {ordem.descricao}
  </p>
  <p>
    <strong>Data Abertura:</strong>{" "}
    {formatarDataBrasil(ordem.dataAbertura)}
  </p>

  <div>
    <label>Solução aplicada:</label>
    <textarea
      value={solucao}
      onChange={(e) => setSolucao(e.target.value)}
      rows={5}
    />
  </div>

  <div>
    <label>Custo (opcional):</label>
    <input
      type="number"
      value={custo}
      onChange={(e) => setCusto(e.target.value)}
    />
  </div>

  <button className="btn-finalizar" onClick={finalizarOrdem}>
    Finalizar Ordem
  </button>

  {/* Mensagens de erro ou sucesso aparecem **abaixo do botão** */}
  {erro && <p className="erro" style={{ marginTop: "15px" }}>{erro}</p>}
  {mensagemSucesso && <p className="sucesso" style={{ marginTop: "15px" }}>{mensagemSucesso}</p>}
</div>

    </Layout>
  );
}
