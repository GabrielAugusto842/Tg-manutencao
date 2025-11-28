import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "../../telas/Ordens/Ordem.css";

const API_URL = "http://localhost:3002/api/os";

export default function Ordem() {
  const { id } = useParams();
  const [ordem, setOrdem] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    const carregarOrdem = async () => {
      try {
        const resposta = await fetch(`${API_URL}/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (!resposta.ok) throw new Error("Erro ao carregar ordem");

        const dados = await resposta.json();
        setOrdem(dados);
      } catch (e) {
        setErro(e.message);
      } finally {
        setCarregando(false);
      }
    };

    carregarOrdem();
  }, [id]);

  const formatarData = (data) => {
    if (!data) return "-";
    const d = new Date(data);
    return d.toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (carregando) {
    return <div className="ordem-loading">Carregando dados da O.S...</div>;
  }

  if (erro) {
    return <div className="ordem-erro">Erro: {erro}</div>;
  }

return (
  <div className="ordem-folha">
    <h2 className="ordem-titulo">ORDEM DE SERVIÇO</h2>

    {/* --- IDENTIFICAÇÃO GERAL --- */}
    <div className="ordem-secao">
      <h3>1. IDENTIFICAÇÃO</h3>

      <div className="ordem-item">
        <span className="label">Número da O.S:</span>
        <span className="valor">{ordem.idOrdServ}</span>
      </div>

      <div className="ordem-item">
        <span className="label">Código interno:</span>
        <span className="valor">{ordem.codigo}</span>
      </div>

      <div className="ordem-item">
        <span className="label">Status:</span>
        <span
          className="valor"
          style={{
            fontWeight: "bold",
            color:
              ordem.status === "Aberto"
                ? "blue"
                : ordem.status === "Em andamento"
                ? "orange"
                : "green",
          }}
        >
          {ordem.status}
        </span>
      </div>

      <div className="ordem-item">
        <span className="label">Máquina parada?</span>
        <span className="valor">{ordem.operacao ? "Não" : "Sim"}</span>
      </div>
    </div>

    {/* --- MÁQUINA / SETOR --- */}
    <div className="ordem-secao">
      <h3>2. INFORMAÇÕES DA MÁQUINA</h3>

      <div className="ordem-item">
        <span className="label">Máquina:</span>
        <span className="valor">{ordem.nomeMaquina}</span>
      </div>

      <div className="ordem-item">
        <span className="label">Setor:</span>
        <span className="valor">{ordem.setor}</span>
      </div>

      <div className="ordem-item">
        <span className="label">Número de série:</span>
        <span className="valor">{ordem.numeroSerie || "-"}</span>
      </div>
    </div>

    {/* --- DESCRIÇÃO DO PROBLEMA --- */}
    <div className="ordem-secao">
      <h3>3. DESCRIÇÃO DO PROBLEMA</h3>
      <div className="descricao-bloco">{ordem.descricao}</div>
    </div>

    {/* --- SOLUÇÃO --- */}
    <div className="ordem-secao">
      <h3>4. SOLUÇÃO (se preenchida)</h3>
      <div className="descricao-bloco">{ordem.solucao || "— Ainda não preenchida —"}</div>
    </div>

    {/* --- DATAS --- */}
    <div className="ordem-secao">
      <h3>5. DATAS</h3>

      <div className="ordem-item">
        <span className="label">Abertura:</span>
        <span className="valor">{formatarData(ordem.dataAbertura)}</span>
      </div>

      <div className="ordem-item">
        <span className="label">Início:</span>
        <span className="valor">{formatarData(ordem.dataInicio)}</span>
      </div>

      <div className="ordem-item">
        <span className="label">Término:</span>
        <span className="valor">{formatarData(ordem.dataTermino)}</span>
      </div>
    </div>

    {/* --- RESPONSÁVEL --- */}
    <div className="ordem-secao">
      <h3>6. RESPONSÁVEL TÉCNICO</h3>

      <div className="ordem-item">
        <span className="label">Manutentor:</span>
        <span className="valor">{ordem.nomeUsuario || "-"}</span>
      </div>

      <div className="ordem-item">
        <span className="label">ID Usuário:</span>
        <span className="valor">{ordem.idUsuario || "-"}</span>
      </div>
    </div>

    {/* --- CUSTOS --- */}
    <div className="ordem-secao">
      <h3>7. CUSTOS</h3>
      <div className="ordem-item">
        <span className="label">Custo total:</span>
        <span className="valor">
  {ordem.custo != null ? `R$ ${Number(ordem.custo).toFixed(2)}` : "Não informado"}
</span>

      </div>
    </div>
  </div>
);

}
