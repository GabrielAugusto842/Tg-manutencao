import React, { useState, useEffect } from "react";
import Layout from "../../componentes/Layout/Layout";
import "../../telas/Ordens/CadastrarOrdens.css";
import api from "../../Services/api.jsx";

function CadastrarOrdemServico() {
  const [descricao, setDescricao] = useState("");
  const [idMaquina, setIdMaquina] = useState("");
  const [idSetor, setIdSetor] = useState("");
  const [operacao, setOperacao] = useState(false); // novo estado
  const [maquinas, setMaquinas] = useState([]);
  const [maquinasFiltradas, setMaquinasFiltradas] = useState([]);
  const [setores, setSetores] = useState([]);
  const [mensagem, setMensagem] = useState("");

  useEffect(() => {
    const carregarDados = async () => {
      try {
        const maquinasResponse = await api.get("/maquina");
        setMaquinas(maquinasResponse.data);
        setMaquinasFiltradas(maquinasResponse.data);
      } catch (error) {
        console.error("Erro ao carregar Máquinas:", error);
      }

      try {
        const setoresResponse = await api.get("/setores");
        setSetores(setoresResponse.data);
      } catch (error) {
        console.error("Erro ao carregar Setores:", error);
      }
    };

    carregarDados();
  }, []);

  useEffect(() => {
    if (idSetor) {
      const filtradas = maquinas.filter(
        (maquina) => String(maquina.idSetor) === String(idSetor)
      );
      setMaquinasFiltradas(filtradas);

      if (
        !filtradas.find(
          (m) => String(m.idMaquina || m.id_maquina) === String(idMaquina)
        )
      ) {
        setIdMaquina("");
      }
    } else {
      setMaquinasFiltradas(maquinas);
      setIdMaquina("");
    }
  }, [idSetor, maquinas, idMaquina]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!descricao || !idMaquina) {
      setMensagem("Preencha a descrição e selecione a máquina.");
      return;
    }

    try {
      const dadosOrdemServico = {
        descricao,
        operacao, // envia true ou false conforme selecionado
        idMaquina,
      };

      const response = await api.post("/os", dadosOrdemServico);

      console.log("Ordem de Serviço cadastrada:", response.data);
      setMensagem(
        "Ordem de Serviço cadastrada com sucesso! Ela está aberta para manutenção."
      );

      // reset campos
      setDescricao("");
      setIdMaquina("");
      setIdSetor("");
      setOperacao(false);
    } catch (error) {
      console.error("Erro ao criar OS:", error.response || error.message);
      setMensagem(
        `Erro ao cadastrar OS: ${
          error.response?.data?.error || "Erro desconhecido"
        }`
      );
    }
  };

  return (
    <Layout title="Cadastro de Ordem de Serviço">
      <div className="form-container" style={{ marginTop: "20px" }}>
        <form onSubmit={handleSubmit}>
          {/* Setor */}
          <div className="form-group full-width">
            <label htmlFor="idSetor">Setor:</label>
            <select
              id="idSetor"
              value={idSetor}
              onChange={(e) => setIdSetor(e.target.value)}
            >
              <option value="">Todos os Setores</option>
              {setores.map((setor, i) => (
                <option key={setor.idSetor || i} value={setor.idSetor}>
                  {setor.nomeSetor}
                </option>
              ))}
            </select>
          </div>

          {/* Máquina */}
          <div className="form-group full-width">
            <label htmlFor="idMaquina">
              Máquina:<span className="required">*</span>
            </label>
            <select
              id="idMaquina"
              value={idMaquina}
              onChange={(e) => setIdMaquina(e.target.value)}
              required
            >
              <option value="" disabled>
                {idSetor
                  ? `Selecione a Máquina... (${maquinasFiltradas.length} encontradas)`
                  : "Selecione a Máquina..."}
              </option>
              {maquinasFiltradas.map((maquina, i) => (
                <option key={maquina.idMaquina || i} value={maquina.idMaquina}>
                  {maquina.nome}
                </option>
              ))}
            </select>
          </div>
          {/* Máquina parada */}
          <div className="form-group full-width">
            <label>Máquina está parada?</label>
            <div style={{ display: "flex", gap: "20px", marginTop: "5px" }}>
              <label>
                <input
                  type="radio"
                  name="parada"
                  value="true"
                  checked={operacao === true}
                  onChange={() => setOperacao(true)}
                />
                Sim
              </label>
              <label>
                <input
                  type="radio"
                  name="parada"
                  value="false"
                  checked={operacao === false}
                  onChange={() => setOperacao(false)}
                />
                Não
              </label>
            </div>
          </div>

          {/* Descrição */}
          <div className="form-group full-width">
            <label htmlFor="descricao">
              Descrição do Problema:<span className="required">*</span>
            </label>
            <textarea
              id="descricao"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Descreva detalhadamente o problema..."
              rows="4"
              required
            />
          </div>

          <div className="form-group full-width" style={{ marginTop: "30px" }}>
            <button
              type="submit"
              className="form-button primary-button full-width"
            >
              Abrir Ordem de Serviço
            </button>
          </div>
        </form>

        {mensagem && (
          <p
            className={`message-feedback ${
              mensagem.includes("sucesso") ? "success" : "error"
            }`}
          >
            {mensagem}
          </p>
        )}
      </div>
    </Layout>
  );
}

export default CadastrarOrdemServico;
