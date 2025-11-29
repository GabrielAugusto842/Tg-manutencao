import React, { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

const API_URL = "http://localhost:3002/api/relatorios";

export default function MttrRelatorio() {
  const [mttrGeral, setMttrGeral] = useState(null); // null para indicar "não carregado"
  const [mttrPorMaquina, setMttrPorMaquina] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    const buscarMTTR = async () => {
      try {
        setCarregando(true);
        setErro(null);

        // MTTR Geral
        const respostaGeral = await fetch(`${API_URL}/mttr-geral`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        if (!respostaGeral.ok) throw new Error("Erro ao buscar MTTR geral");
        const dadosGeral = await respostaGeral.json();
        // Garantir número
        setMttrGeral(dadosGeral?.mttr ?? 0);

        // MTTR por Máquina
        const respostaMaquina = await fetch(`${API_URL}/mttr-maquina`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        if (!respostaMaquina.ok)
          throw new Error("Erro ao buscar MTTR por máquina");
        const dadosMaquina = await respostaMaquina.json();
        setMttrPorMaquina(dadosMaquina || []);
      } catch (e) {
        console.error(e);
        setErro(e.message);
      } finally {
        setCarregando(false);
      }
    };

    buscarMTTR();
  }, []);

  if (carregando) return <div>Carregando relatório MTTR...</div>;

  return (
    <div>
      {erro && <div style={{ color: "red" }}>{erro}</div>}

      <h2>
        MTTR Geral:{" "}
        {typeof mttrGeral === "number" ? mttrGeral.toFixed(2) : "-"} horas
      </h2>

      <h2>MTTR por Máquina</h2>
      {mttrPorMaquina.length === 0 ? (
        <p>Nenhuma máquina encontrada.</p>
      ) : (
        <BarChart width={600} height={300} data={mttrPorMaquina}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="maquina" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="mttr" fill="#8884d8" />
        </BarChart>
      )}
    </div>
  );
}
