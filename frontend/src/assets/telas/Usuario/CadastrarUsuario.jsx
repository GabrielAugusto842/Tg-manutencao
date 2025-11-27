import React, { useEffect, useState } from "react";
import Layout from "../../componentes/Layout/Layout";
import axios from "axios";
import api from "../../Services/api.jsx";
import "../../telas/Usuario/CadastrarUsuario.css?=1.0.3";

function CadastrarUsuario() {
  // 1. Estados atualizados: adicionar 'setor'
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [setor, setSetor] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [nome, setNome] = useState("");
  const [idCargo, setIdCargo] = useState(null);
  const [idSetor, setIdSetor] = useState(null);

  const [opcoesCargo, setOpcoesCargo] = useState([]);

  const [opcoesSetor, setOpcoesSetor] = useState([]);

  useEffect(() => {
    const carregarCargos = async () => {
      try {
        const cargosResponse = await api.get("/cargo");
        const cargosFormatados = cargosResponse.data.map((cargo) => ({
          id: cargo.idCargo,
          nome: cargo.cargo,
        }));
        setOpcoesCargo(cargosFormatados);
      } catch (error) {
        console.error("Erro ao carregar cargos:", error);
      }
    };

    carregarCargos();
  }, []);

  useEffect(() => {
    const carregarDados = async () => {
      try {
        const setoresResponse = await api.get("/setores");
        const setoresFormatados = setoresResponse.data.map((setor) => ({
          id: setor.idSetor,
          nome: setor.nomeSetor,
        }));

        setOpcoesSetor(setoresFormatados);
      } catch (error) {
        console.error("Erro ao carregar Setores:", error);
      }
    };
    carregarDados();
  }, []);

  const handleCargoChange = (e) => {
    const idSelecionado = Number(e.target.value);
    setIdCargo(idSelecionado);
  };

  const handleSetorChange = (e) => {
    const nomeSelecionado = e.target.value;
    setSetor(nomeSelecionado);

    const setorObj = opcoesSetor.find((op) => op.nome === nomeSelecionado);
    setIdSetor(setorObj ? setorObj.id : null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!idCargo || !idSetor) {
      setMensagem("Por favor, selecione um cargo e um setor.");
      return;
    }

    const dadosUsuario = {
      email,
      password,
      nome,
      id_setor: idSetor,
      id_cargo: idCargo,
    };

    try {
      // Substitua '/api/cadastro' pela URL real do seu backend
      const response = await axios.post(
        "http://localhost:3002/api/user",
        dadosUsuario
      );

      console.log("Usuário cadastrado com sucesso:", response.data);
      setMensagem("Usuário cadastrado com sucesso!");

      // Opcional: Limpar o formulário após o sucesso
      setEmail("");
      setPassword("");
      setSetor("");
      setNome("");
      setIdSetor(null);
      setIdCargo(null);
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
            <div className="form-group full-width">
              <label htmlFor="nome">
                Nome: <span className="required">*</span>
              </label>
              <input
                id="nome"
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Informe o nome do usuário..."
                required
              />
            </div>
          </div>

          <div className="form-row">
            {/* Campo Cargo/Setor (Grupo) */}
            <div className="form-group half-width">
              <label htmlFor="cargo">
                Cargo:<span className="required">*</span>
              </label>
              <select
                id="cargo"
                value={idCargo || ""}
                onChange={handleCargoChange}
                required
              >
                <option value="" disabled>
                  Selecione um cargo...
                </option>

                {opcoesCargo.map((opcao) => (
                  <option key={opcao.id} value={opcao.id}>
                    {opcao.nome}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group half-width">
              <label htmlFor="setor">
                Setor:<span className="required">*</span>
              </label>
              <select
                id="setor"
                value={setor}
                onChange={handleSetorChange}
                required
              >
                <option value="" disabled>
                  Selecione um setor...
                </option>

                {opcoesSetor.map((opcao) => (
                  <option key={opcao.id} value={opcao.nome}>
                    {opcao.nome}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* LINHA 2: E-mail (Uma Coluna de Largura Total) */}
          <div className="form-group full-width">
            <label htmlFor="email">
              E-mail: <span className="required">*</span>
            </label>
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
            <label htmlFor="password">
              Senha: <span className="required">*</span>
            </label>
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
          <div className="form-group full-width" style={{ marginTop: "30px" }}>
            <button
              type="submit"
              className="form-button primary-button full-width"
            >
              Cadastrar usuário
            </button>
          </div>
        </form>

        {/* Exibir mensagem de feedback */}
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

export default CadastrarUsuario;
