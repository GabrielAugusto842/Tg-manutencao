import React, { useEffect, useState } from "react";
import { formatHoras } from "../../Services/formatters";

const API_URL = "http://localhost:3002/api/relatorios";

export default function MttaMaquinaResumoCard({
  mes,
  ano,
  idSetor,
  idMaquina,
  onValorCarregado, // ← ADICIONADO
}) {
  const [mtta, setMtta] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    const buscarMTTAMaquina = async () => {
      setCarregando(true);
      setErro(null);

      try {
        const params = new URLSearchParams();
        if (mes !== "") params.append("mes", mes);
        if (ano !== "") params.append("ano", ano);
        if (idSetor !== "") params.append("idSetor", idSetor);
        if (idMaquina !== "") params.append("idMaquina", idMaquina);

        const query = params.toString() ? `?${params.toString()}` : "";

        const resp = await fetch(`${API_URL}/mtta-maquina${query}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (!resp.ok) throw new Error("Erro ao buscar MTTA da máquina");

        const dados = await resp.json();
        const valor = dados?.mtta ?? 0;

        setMtta(valor);

        // 🔥 Envia o valor para o Dashboard
        if (onValorCarregado) {
          onValorCarregado("MTTA", idMaquina, valor);
        }
      } catch (e) {
        console.error("Erro MTTA Máquina:", e);
        setErro(e.message);
      } finally {
        setCarregando(false);
      }
    };

    buscarMTTAMaquina();
  }, [mes, ano, idSetor, idMaquina]);

  return (
    <div className="kpi-card">
      <h4 className="card-titulo-pequeno">MTTA</h4>

      {carregando && <p>Carregando...</p>}
      {erro && <p className="erro-kpi">{erro}</p>}
      {!carregando && !erro && (
        <p className="kpi-valor-simples">{formatHoras((mtta ?? 0) / 60)}</p>
      )}
    </div>
  );
}
