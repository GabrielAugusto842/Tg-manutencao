import React, { useState } from "react";
import Layout from "../../componentes/Layout/Layout";
import MttrRelatorio from "./MttrRelatorio";

export default function Relatorios( ) {
  const [relatorioSelecionado, setRelatorioSelecionado] = useState("mttr");

  return (
    <Layout title="Relatório MTTR">
      <div className="relatorios-menu">
        <button onClick={() => setRelatorioSelecionado("mttr")}>MTTR</button>
      </div>

      <div className="relatorio-conteudo">
        {relatorioSelecionado === "mttr" && <MttrRelatorio />}
      </div>
    </Layout>
  );
}
