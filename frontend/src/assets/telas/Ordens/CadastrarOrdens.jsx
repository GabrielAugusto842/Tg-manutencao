import React, { useState, useEffect } from "react";
import Layout from "../../componentes/Layout/Layout";
import axios from "axios";
import "../Ordens/CadastrarOrdens.css"; // Assumindo que você criou o CSS separado aqui

// Defina a ID do usuário logado através de um mecanismo de autenticação real
// Substitua este valor estático (1) pelo ID obtido do seu Contexto/Redux/Auth
const USUARIO_LOGADO_ID = 1; 

function CadastrarOrdemServico() {
  const [descricao, setDescricao] = useState("");
  const [dataInicio, setDataInicio] = useState(
    new Date().toISOString().substring(0, 16)
  ); 
  
  const [idUsuario] = useState(USUARIO_LOGADO_ID);
  const [idMaquina, setIdMaquina] = useState(""); 
  const [idEstado, setIdEstado] = useState("1"); 
  const [custo, setCusto] = useState("");
  const [mensagem, setMensagem] = useState("");

  // Dados reais virão do backend
  const [maquinas, setMaquinas] = useState([]);
  const [estados, setEstados] = useState([]);


  useEffect(() => {
    const carregarDados = async () => {
      try {
        // ----------------------------------------------------
        // TODO: Substitua estas chamadas simuladas pelas reais do seu backend!
        // ----------------------------------------------------

        // Exemplo de busca de Máquinas
        const maquinasResponse = await axios.get("http://localhost:3001/api/maquinas/list");
        setMaquinas(maquinasResponse.data);

        // Exemplo de busca de Estados (Aberto, Em Andamento, Fechado)
        const estadosResponse = await axios.get("http://localhost:3001/api/estados/list");
        // Filtra para mostrar apenas o estado inicial (ID 1), se desejar
        setEstados(estadosResponse.data.filter(e => e.id_estado === 1)); 

      } catch (error) {
        console.error("Erro ao carregar dados para o formulário:", error);
        // Opcional: setMensagem("Erro ao carregar listas de opções.");
      }
    };
    
    carregarDados();
  }, []); 


  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!descricao || !idMaquina) {
      setMensagem("Por favor, preencha a descrição e selecione a máquina.");
      return;
    }

    const dadosOrdemServico = {
      descricao,
      data_inicio: dataInicio, 
      id_usuario: idUsuario, 
      id_maquina: idMaquina,
      id_estado: idEstado,
      custo: custo,
    };

    try {
      const response = await axios.post(
        "http://localhost:3001/api/ordenservico",
        dadosOrdemServico
      );

      console.log("Ordem de Serviço cadastrada com sucesso:", response.data);
      setMensagem("Ordem de Serviço cadastrada com sucesso!");

      setDescricao("");
      setIdMaquina("");
      setIdEstado("1"); 
      setCusto("");
      
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
      <div className="form-container">
        
        {/* Aviso informativo removido, pois o ID do usuário deve ser transparente para o usuário final */}

        <form onSubmit={handleSubmit}>
          
          <div className="form-row">
            
            <div className="form-group half-width">
              <label htmlFor="idMaquina">Máquina:<span className="required">*</span></label>
              <select
                id="idMaquina"
                value={idMaquina}
                onChange={(e) => setIdMaquina(e.target.value)}
                required
              >
                <option value="" disabled>Selecione a Máquina...</option>
                {maquinas.map((maquina) => (
                  <option key={maquina.id_maquina} value={maquina.id_maquina}>
                    {maquina.nome}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group half-width">
              <label htmlFor="dataInicio">Data e Hora de Início:</label>
              <input
                id="dataInicio"
                type="datetime-local" 
                value={dataInicio}
                onChange={(e) => setDataInicio(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-row">

            <div className="form-group half-width">
              <label htmlFor="custo">Custo Estimado (R$):</label>
              <input
                id="custo"
                type="number" // Tipo number para números
                step="0.01" // Permite duas casas decimais
                value={custo}
                onChange={(e) => setCusto(e.target.value)}
                placeholder="Ex: 50.00"
                // Removido o 'required'
              />
            </div>

            {/* Mantido apenas para fins de exibição/informação do estado inicial */}
            <div className="form-group half-width">
              <label htmlFor="idEstado">Estado Inicial:</label>
              <select
                id="idEstado"
                value={idEstado}
                required
                disabled 
              >
                {/* O estado inicial será sempre o ID 1, que deve ser 'Aberta' */}
                {estados.map((estado) => (
                  <option key={estado.id_estado} value={estado.id_estado}>
                    {estado.nome}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="form-group full-width">
            <label htmlFor="descricao">Descrição do Problema:<span className="required">*</span></label>
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