import React, { useState, useEffect } from "react";
import Layout from "../../componentes/Layout/Layout";
import "../../telas/Ordens/CadastrarOrdens.css";
import api from "../../Services/api.jsx";

const USUARIO_LOGADO_ID = 1;

function CadastrarOrdemServico() {
  const [descricao, setDescricao] = useState("");

  const [idUsuario] = useState(USUARIO_LOGADO_ID);
  const [idMaquina, setIdMaquina] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [idSetor, setIdSetor] = useState("");
  const [maquinas, setMaquinas] = useState([]);
  const [estados, setEstados] = useState([]);
  const [setores, setSetores] = useState([]);

  const [maquinasFiltradas, setMaquinasFiltradas] = useState([]);

  useEffect(() => {
    const carregarDados = async () => {
      // --- Carregamento de Máquinas ---
      try {
        const maquinasResponse = await api.get("/maquina");
        setMaquinas(maquinasResponse.data);
        setMaquinasFiltradas(maquinasResponse.data);
        // eslint-disable-next-line no-unused-vars
      } catch (error) {
        console.warn("Aviso: Falha ao carregar Máquinas. Continuando...");
      }

      // --- Carregamento de Setores ---
      try {
        const setoresReponse = await api.get("/setores");
        setSetores(setoresReponse.data);
      } catch (error) {
        console.error("Erro ao carregar Setores:", error);
      }

      // --- Carregamento de Estados ---
      try {
        const estadosOS = await api.get("/estado");
        setEstados(estadosOS.data);
      } catch (error) {
        console.error("Erro ao carregar Estados:", error);
      }
    };

    carregarDados();
  }, []);

  useEffect(() => {
    if (idSetor) {
      const filtradas = maquinas.filter(
        // Corrigindo para verificar se a propriedade existe antes de comparar
        (maquina) =>
          maquina.idSetor && String(maquina.idSetor) === String(idSetor)
      );
      setMaquinasFiltradas(filtradas); // Limpa a seleção se a máquina atual não estiver no novo filtro

      if (!filtradas.find((m) => String(m.id_maquina) === String(idMaquina))) {
        setIdMaquina("");
      }
    } else {
      // Se "Todos os Setores" ou nada for selecionado
      setMaquinasFiltradas(maquinas);
      setIdMaquina("");
    }
  }, [idSetor, maquinas, idMaquina]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!descricao || !idMaquina) {
      setMensagem("Por favor, preencha a descrição e selecione a máquina.");
      return;
    }

    const estadoAberto = estados.find(
      (estado) => estado.status && estado.status.toLowerCase() === "aberta"
    );

    if (!estadoAberto) {
      setMensagem("Não foi possivel encontrar o estado aberto no sistema");
      return;
    }

    const dataHoraSubmissao = new Date().toISOString();
    const estadoInicialID = estadoAberto.idEstado;

    const dadosOrdemServico = {
      descricao,
      data_inicio: dataHoraSubmissao,
      id_usuario: idUsuario,
      id_maquina: idMaquina,
      id_estado: estadoInicialID,
    };

    try {
      const response = await api.post("/ordenservico", dadosOrdemServico);

      console.log("Ordem de Serviço cadastrada com sucesso:", response.data);
      setMensagem(
        "Ordem de Serviço cadastrada com sucesso! Ela está aberta para manutenção."
      );

      setIdSetor("");
      setDescricao("");
      setIdMaquina("");
    } catch (error) {
      console.error(
        "Erro no cadastro da OS:",
        error.response ? error.response.data : error.message
      );
      setMensagem(
        `Erro ao cadastrar OS: ${
          error.response?.data?.message || "Erro desconhecido"
        }`
      );
    }
  };

  return (
    <Layout title="Cadastro de Ordem de Serviço">
      <div className="form-container" style={{ marginTop: "20px" }}>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            {/* Campo de Seleção de Setor */}
            <div className="form-group full-width">
              <label htmlFor="idSetor">Setor:</label>
              <select
                id="idSetor"
                value={idSetor}
                onChange={(e) => setIdSetor(e.target.value)}
              >
                <option value="">Todos os Setores</option>
                {setores.map((setor, index) => (
                  <option
                    // CORREÇÃO: Chave fallback para evitar "key=undefined"
                    key={
                      setor.idSetor ? String(setor.idSetor) : `setor-${index}`
                    }
                    value={
                      setor.idSetor
                        ? String(setor.idSetor)
                        : `setor_null_${index}`
                    }
                  >
                    {setor.nomeSetor}
                    {/* CORREÇÃO: Usando 'setor' em vez de 'nomeSetor' */}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* LINHA 2: Máquina */}
          <div className="form-row">
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
                    : "Selecione a ..."}
                </option>
                {maquinasFiltradas.map((maquina, index) => (
                  <option
                    // CORREÇÃO: Chave fallback para evitar "key=undefined"
                    key={
                      maquina.idMaquina
                        ? String(maquina.idMaquina)
                        : `maquina_null_${index}`
                    }
                    value={String(maquina.idMaquina)}
                  >
                    {maquina.nome}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* LINHA 3: Descrição */}
          <div className="form-group full-width">
            <label htmlFor="descricao">
              Descrição do Problema:<span className="required">*</span>
            </label>
            <textarea
              id="descricao"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Descreva detalhadamente o problema ou a manutenção a ser realizada..."
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
