import React, { useState, useEffect } from "react";
import Layout from "../../componentes/Layout/Layout";
import axios from "axios";
import "../../telas/Ordens/CadastrarOrdens.css";

const USUARIO_LOGADO_ID = 1; 

function CadastrarOrdemServico() {
  const [descricao, setDescricao] = useState(""); 
  
  const [idUsuario] = useState(USUARIO_LOGADO_ID);
  const [idMaquina, setIdMaquina] = useState(""); 
  const [mensagem, setMensagem] = useState("");
  const [maquinas, setMaquinas] = useState([]);

  useEffect(() => {
    const carregarDados = async () => {
      try {
        // Busca de Máquinas
        const maquinasResponse = await axios.get("http://localhost:3001/api/maquinas");
        setMaquinas(maquinasResponse.data);

      } catch (error) {
        console.error("Erro ao carregar dados para o formulário:", error);
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

    
    const dataHoraSubmissao = new Date().toISOString(); 
    const estadoInicial = "1"; // '1' representa "Aberta"



    const dadosOrdemServico = {
      descricao,
      data_inicio: dataHoraSubmissao, 
      id_usuario: idUsuario, 
      id_maquina: idMaquina,
      id_estado: estadoInicial, 
    };

    try {
      const response = await axios.post(
        "http://localhost:3001/api/ordenservico",
        dadosOrdemServico
      );

      console.log("Ordem de Serviço cadastrada com sucesso:", response.data);
      setMensagem("Ordem de Serviço cadastrada com sucesso! Ela está aberta para manutenção.");

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
            
            <div className="form-group full-width"> 
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

            {/* [REMOVIDO] Campo Custo (custo) - OPCIONAL */}
            
          </div>
          
          {/* LINHA 2: Descrição */}
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