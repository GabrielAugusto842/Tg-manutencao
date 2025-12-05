import React, { useEffect, useState } from "react";

const API_URL = "http://localhost:3002/api/relatorios";

export default function CustoMaquinaResumoCard({ mes, ano, idSetor, idMaquina }) {
  const [custo, setCusto] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    const buscarCustoMaquina = async () => {
      setCarregando(true);
      setErro(null);

      try {
        const params = new URLSearchParams();
        if (mes !== "") params.append("mes", mes);
        if (ano !== "") params.append("ano", ano);
        if (idSetor !== "") params.append("idSetor", idSetor);
        if (idMaquina !== "") params.append("idMaquina", idMaquina);

        const query = params.toString() ? `?${params.toString()}` : "";

        const resp = await fetch(`${API_URL}/custo-maquina${query}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (!resp.ok) throw new Error("Erro ao buscar custo da máquina");

        const dados = await resp.json();
        setCusto(dados?.custo ?? 0);
      } catch (e) {
        console.error("Erro Custo Máquina:", e);
        setErro(e.message);
      } finally {
        setCarregando(false);
      }
    };

    buscarCustoMaquina();
  }, [mes, ano, idSetor, idMaquina]);

  return (
    <div className="kpi-card">
      <h4 className="card-titulo-pequeno">Custo</h4>

      {carregando && <p>Carregando...</p>}
      {erro && <p className="erro-kpi">{erro}</p>}
      {!carregando && !erro && (
        <p className="kpi-valor-simples">R$ {custo.toFixed(2)}</p>
      )}
    </div>
  );
}
