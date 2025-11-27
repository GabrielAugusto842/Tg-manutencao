import React, { useState } from "react";
import Layout from "../../componentes/Layout/Layout";
import "../../telas/Setor/CadastrarSetor.css?=1.0.2";
import api from "../../Services/api.jsx";

function CadastrarSetor() {
  const [descricao, setDescricao] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [nomeSetor, setNomeSetor] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!nomeSetor || !descricao) {
      setMensagem("Por favor, preencha o nome do setor e a descrição.");
      return;
    }

    const dadosSetor = {
      setor: nomeSetor,
      descricao,
    };

    try {
      const response = await api.post("/setores", dadosSetor);

      console.log("Setor cadastrado com sucesso:", response.data);
      setMensagem(`Setor '${nomeSetor}' cadastrado com sucesso!`);

      setNomeSetor("");
      setDescricao("");
    } catch (error) {
      console.error(
        "Erro ao cadastrar setor: ",
        error.response ? error.response.data : error.mensagem
      );
    }
  };

  return (
    <Layout title="Cadastro de Novo Setor">
      <div className="form-container" style={{ marginTop: "20px" }}>
        <form onSubmit={handleSubmit}>
          {/* LINHA 1: Setor e Direcionamento */}
          <div className="form-group full-width">
            <label htmlFor="nomeSetor">
              Nome do Setor: <span className="required">*</span>
            </label>
            <input
              type="text"
              id="nomeSetor"
              value={nomeSetor}
              onChange={(e) => setNomeSetor(e.target.value)}
              placeholder="Ex: Produção 1, Almoxarifado, Sala de Testes..."
              required
            />
          </div>

          <div className="form-group full-width">
            <label htmlFor="descricao">
              Descrição: <span className="required">*</span>
            </label>
            <textarea
              id="descricao"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Descreve as caracteristicas do setor..."
              rows="4"
              required
            />
          </div>

          <div className="form-group full-width" style={{ marginTop: "30px" }}>
            <button
              type="submit"
              className="form-button primary-button full-width"
            >
              Cadastrar Setor
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

export default CadastrarSetor;
