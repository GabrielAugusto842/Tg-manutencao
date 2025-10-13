import React, { useState } from "react";
import Layout from "../../componentes/Layout/Layout";
import axios from "axios";
import "../../telas/Usuario/CadastrarUsuario.css"

function CadastrarUsuario() {
  // 1. Estados atualizados: adicionar 'setor'
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [setor, setSetor] = useState(""); // Novo estado para o setor
  const [mensagem, setMensagem] = useState("");
  const [nome, setNome] = useState("");

  // 2. Opções para o campo de seleção
  const opcoesSetor = ["Operador", "Técnico", "Gerente", "Manutentor"];

  const handleSubmit = async (e) => {
    e.preventDefault();

    // *Verificação básica: garantir que um setor foi selecionado*
    if (!setor) {
      setMensagem("Por favor, selecione um setor.");
      return;
    }

    // 3. Objeto com os dados a serem enviados (incluindo 'setor')
    const dadosUsuario = {
      email,
      password,
      nome,
      setor, // Adicionar o setor
    };

    try {
      // Substitua '/api/cadastro' pela URL real do seu backend
      const response = await axios.post(
        "http://localhost:5000/api/cadastroUsuario",
        dadosUsuario
      );

      console.log("Usuário cadastrado com sucesso:", response.data);
      setMensagem("Usuário cadastrado com sucesso!");

      // Opcional: Limpar o formulário após o sucesso
      setEmail("");
      setPassword("");
      setSetor("");
      setNome("");

    } catch (error) {
      console.error(
        "Erro no cadastro:",
        error.response ? error.response.data : error.message
      );
      setMensagem(
        `Erro ao cadastrar: ${
          error.response?.data?.message || "Erro desconhecido"
        }`
      );
    }
  };

// ... (código do componente acima)

  return (
    <Layout title="Cadastro de Usuário">
      
      <div className="form-container"> 
        
        <form onSubmit={handleSubmit}>
          
          {/* LINHA 1: Nome e Grupo (Duas Colunas) */}
          <div className="form-row"> 
            
            {/* Campo Nome */}
            <div className="form-group half-width"> 
              <label htmlFor="nome">Nome: <span className="required">*</span></label>
              <input
                id="nome"
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Informe o nome do usuário..."
                required
              />
            </div>

            {/* Campo Cargo/Setor (Grupo) */}
            <div className="form-group half-width"> 
              <label htmlFor="setor">Setor:<span className="required">*</span></label>
              <select
                id="setor"
                value={setor}
                onChange={(e) => setSetor(e.target.value)}
                required
              >
                <option value="" disabled>
                  Selecione um setor...
                </option>
                
                {opcoesSetor.map((opcao) => (
                  <option key={opcao} value={opcao}>
                    {opcao}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          {/* LINHA 2: E-mail (Uma Coluna de Largura Total) */}
          <div className="form-group full-width"> 
            <label htmlFor="email">E-mail: <span className="required">*</span></label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Informe o e-mail do usuário..."
              required
            />
          </div>
          
          {/* LINHA 3: Senha (Uma Coluna de Largura Total) */}
          <div className="form-group full-width">
            <label htmlFor="password">Senha: <span className="required">*</span></label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Digite a senha..."
              required
            />
          </div>
          
          {/* Botão de Submissão (Apenas um botão de Largura Total) */}
          <div className="form-group full-width" style={{marginTop: '30px'}}>
             <button 
                type="submit" 
                className="form-button primary-button full-width"
             >
                Cadastrar
             </button>
          </div>

        </form>

        {/* Exibir mensagem de feedback */}
        {mensagem && (
            <p className={`message-feedback ${mensagem.includes('sucesso') ? 'success' : 'error'}`}>
                {mensagem}
            </p>
        )}
      </div> 
      
    </Layout>
  );
}

export default CadastrarUsuario;