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
  const [idUsuarioDirecionado, setIdUsuarioDirecionado] = useState("");
  const [usuarios] = useState([]);
  const [setores , setSetores] = useState([]);

  const [maquinasFiltradas, setMaquinasFiltradas] = useState([]);

  useEffect(() => {
    const carregarDados = async () => {
      try {
        // Busca de Máquinas
        const maquinasResponse = await api.get("/maquinas");
        setMaquinas(maquinasResponse.data);
        setMaquinas(maquinasResponse.data);
        setMaquinasFiltradas(maquinasResponse.data);

        const setoresReponse = await api.get("/setores");
        setSetores(setoresReponse.data);

        const estadosOS = await api.get("/estados");
        setEstados(estadosOS.data);

      } catch (error) {
        console.error("Erro ao carregar dados para o formulário:", error);
      }
    };

    carregarDados();
  }, []);


  useEffect(() => {
    if(idSetor) {
      const filtradas = maquinas.filter(
        (maquina) => String(maquina.id_setor) === String (idSetor)
      );
      setMaquinasFiltradas(filtradas);

      // Se a máquina atual não estiver no novo filtro, limpa a seleção
      if (!filtradas.find(m => String(m.id_maquina) === String(idMaquina))) {
          setIdMaquina("");
      }
    } else {
      // Se nenhum setor for selecionado, mostra todas as máquinas
      setMaquinasFiltradas(maquinas);
    }
  }, [idSetor, maquinas, idMaquina]);


  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!descricao || !idMaquina) {
      setMensagem("Por favor, preencha a descrição e selecione a máquina.");
      return;
    }

    const estadoAberto = estados.find (
      (estado) => estado.status && estado.status.toLowerCase() === 'aberta');

    if (!estadoAberto){
      setMensagem("Não foi possivel encontrar o estado aberto no sistema")
      return;
    }

    const dataHoraSubmissao = new Date().toISOString;
    const estadoInicialID = estadoAberto.idEstado;

    const dadosOrdemServico = {
      descricao,
      data_inicio: dataHoraSubmissao,
      id_usuario: idUsuario,
      id_maquina: idMaquina,
      id_estado: estadoInicialID,
      id_usuario_direcionado: idUsuarioDirecionado || null,
    };

    try {
      const response = await api.post("/ordenservico", dadosOrdemServico);

      console.log("Ordem de Serviço cadastrada com sucesso:", response.data);
      setMensagem(
        "Ordem de Serviço cadastrada com sucesso! Ela está aberta para manutenção."
      );

      setIdUsuarioDirecionado("");
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
          {/* LINHA 1: Setor e Direcionamento */}
          <div className="form-row">
            {/* Campo de Seleção de Setor */}
            <div className="form-group half-width">
              <label htmlFor="idSetor">Setor:</label>
              <select
                id="idSetor"
                value={idSetor}
                onChange={(e) => setIdSetor(e.target.value)}
              >
                <option value="">Todos os Setores</option>
                {setores.map((setor) => (
                  <option key={setor.id_setor} value={setor.id_setor}>
                    {setor.nome}
                  </option>
                ))}
              </select>
            </div>

            {/* Campo de Direcionamento (Opcional) */}
            <div className="form-group half-width">
              <label htmlFor="idUsuarioDirecionado">Direcionar para (Opcional):</label>
              <select
                id="idUsuarioDirecionado"
                value={idUsuarioDirecionado}
                onChange={(e) => setIdUsuarioDirecionado(e.target.value)}
              >
                <option value="">Não direcionar</option>
                {usuarios.map((usuario) => (
                  <option key={usuario.id_usuario} value={usuario.id_usuario}>
                    {usuario.nome}
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
                  {idSetor ? `Selecione a Máquina... (${maquinasFiltradas.length} encontradas)` : "Selecione a ..."}
                </option>
                {maquinasFiltradas.map((maquina) => (
                  <option key={maquina.id_maquina} value={maquina.id_maquina}>
                    {maquina.nome}
                  </option>
                ))}
              </select>
            </div>

            {/* [REMOVIDO] Campo Custo (custo) - OPCIONAL */}
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