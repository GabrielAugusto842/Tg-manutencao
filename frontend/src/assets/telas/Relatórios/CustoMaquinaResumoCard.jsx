import React, { useEffect, useState } from "react";
import api from "../../Services/api.jsx";

export default function CustoMaquinaResumoCard({
  mes,
  ano,
  idSetor,
  idMaquina,
  onValorCarregado,
}) {
  const [custo, setCusto] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    const buscarCustoMaquina = async () => {
      if (!idMaquina) {
        setCusto(0);
        return;
      }

      setCarregando(true);
      setErro(null);

      try {
        const params = { idMaquina };

        if (mes) params.mes = mes;
        if (ano) params.ano = ano;
        if (idSetor) params.idSetor = idSetor;

        const resp = await api.get("/relatorios/custo-maquina", { params });

        const dados = resp.data;
        const valor = dados?.custoTotal ?? 0; // ← AGORA PEGA CERTO

        setCusto(valor);

        if (onValorCarregado) {
          onValorCarregado("CUSTO", idMaquina, valor);
        }
      } catch (e) {
        console.error("Erro Custo Máquina:", e);
        setErro(e.message);
      } finally {
        setCarregando(false);
      }
    };

    buscarCustoMaquina();
  }, [mes, ano, idSetor, idMaquina, onValorCarregado]);

  return (
    <div className="kpi-card">
      <h4 className="card-titulo-pequeno">Custo</h4>

      {carregando && <p>Carregando...</p>}
      {erro && <p className="erro-kpi">{erro}</p>}
      {!carregando && !erro && (
        <p className="kpi-valor-simples">R$ {Number(custo).toFixed(2)}</p>
      )}
    </div>
  );
}
