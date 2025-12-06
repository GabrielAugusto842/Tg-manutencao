import React, { useEffect, useState } from "react";
import { formatHoras } from "../../Services/formatters";
import api from "../../Services/api.jsx";

export default function MtbfMaquinaResumoCard({
  mes,
  ano,
  idSetor,
  idMaquina,
  onValorCarregado, // ← ADICIONADO
}) {
  const [mtbf, setMtbf] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    const buscarMTBFMaquina = async () => {
      setCarregando(true);
      setErro(null);

      try {
        const params = new URLSearchParams();
        if (mes !== "") params.append("mes", mes);
        if (ano !== "") params.append("ano", ano);
        if (idSetor !== "") params.append("idSetor", idSetor);
        if (idMaquina !== "") params.append("idMaquina", idMaquina);

        const resp = await api.get("/relatorios/mtbf-maquina", {
          params: params, // O Axios cuida da query string e dos cabeçalhos
        }); // 🚀 CORREÇÃO 2: Acessa os dados diretamente de resp.data (sem resp.ok ou resp.json())

        const dados = resp.data;
        const valor = dados?.mtbf ?? 0;

        setMtbf(valor);

        if (onValorCarregado) {
          onValorCarregado("MTBF", idMaquina, valor);
        }
      } catch (e) {
        console.error("Erro MTBF Máquina:", e);
        setErro(e.message);
      } finally {
        setCarregando(false);
      }
    };

    buscarMTBFMaquina();
  }, [mes, ano, idSetor, idMaquina, onValorCarregado]);

  return (
    <div className="kpi-card">
      <h4 className="card-titulo-pequeno">MTBF</h4>

      {carregando && <p>Carregando...</p>}
      {erro && <p className="erro-kpi">{erro}</p>}
      {!carregando && !erro && (
        <p className="kpi-valor-simples">{formatHoras((mtbf ?? 0) / 60)}</p>
      )}
    </div>
  );
}
