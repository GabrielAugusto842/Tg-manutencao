import React, { useEffect, useState } from "react";
import { formatHoras } from "../../Services/formatters";

const API_URL = "http://localhost:3002/api/relatorios";

export default function MttrMaquinaResumoCard({
  mes,
  ano,
  idSetor,
  idMaquina,
  onValorCarregado, // <-- NOVO!
}) {
  const [mttr, setMttr] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    const buscarMTTRMaquina = async () => {
      setCarregando(true);
      setErro(null);

      try {
        const params = new URLSearchParams();
        if (mes !== "") params.append("mes", mes);
        if (ano !== "") params.append("ano", ano);
        if (idSetor !== "") params.append("idSetor", idSetor);
        if (idMaquina !== "") params.append("idMaquina", idMaquina);

        const query = params.toString() ? `?${params.toString()}` : "";

        const resp = await fetch(`${API_URL}/mttr-maquina${query}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (!resp.ok) throw new Error("Erro ao buscar MTTR da máquina");

        const dados = await resp.json();
        const valor = dados?.mttr ?? 0;

        setMttr(valor);

        // 🔥 DEVOLVE O VALOR AO COMPONENTE PAI
        if (onValorCarregado) {
          onValorCarregado("MTTR", idMaquina, valor);
        }
      } catch (e) {
        console.error("Erro MTTR Máquina:", e);
        setErro(e.message);
      } finally {
        setCarregando(false);
      }
    };

    buscarMTTRMaquina();
  }, [mes, ano, idSetor, idMaquina]);

  return (
    <div className="kpi-card">
      <h4 className="card-titulo-pequeno">MTTR</h4>

      {carregando && <p>Carregando...</p>}
      {erro && <p className="erro-kpi">{erro}</p>}
      {!carregando && !erro && (
        <p className="kpi-valor-simples">{formatHoras((mttr ?? 0) / 60)}</p>
      )}
    </div>
  );
}
