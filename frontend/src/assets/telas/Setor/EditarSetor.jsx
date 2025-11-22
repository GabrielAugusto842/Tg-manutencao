import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Layout from "../../componentes/Layout/Layout";
import api from "../../Services/api.jsx";


function EditarSetor() {
  const { id } = useParams();

  // Estados
  const [setorNome, setSetorNome] = useState("");
  const [setorDescricao, setSetorDescricao] = useState("");
  const [setorOriginal, setSetorOriginal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);
  const [mensagem, setMensagem] = useState("");

  // Handler de Input
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    // O nome do estado é 'setorNome', o nome do input é 'nomeSetor'
    if (name === "nomeSetor") {
      setSetorNome(value);
    } else if (name === "descricao") {
      setSetorDescricao(value);
    }
  };

  /**
   * Função para buscar os dados do setor para preencher o formulário (GET)
   */
  useEffect(() => {
    const buscarSetor = async () => {
      setLoading(true);
      try {
        // GET por ID do Setor
        const res = await api.get(`/setores/${id}`);

        const dados = res.data;

        // No backend, o campo é 'setor', mas no frontend usamos 'setorNome'
        setSetorOriginal(dados);
        setSetorNome(dados.nomeSetor || ""); // <--- CORRIGIDO: Usa 'dados.setor' se a API retornar 'setor'
        setSetorDescricao(dados.descricao || "");
      } catch (e) {
        setErro(
          "Erro ao buscar setor: " + (e.response?.data?.error || e.message)
        );
      } finally {
        setLoading(false);
      }
    };

    buscarSetor();
  }, [id]);

  /**
   * 💾 Salva as alterações (PUT)
   */
  const handleSalvar = async (e) => {
    e.preventDefault();
    setMensagem("");

    if (!setorNome || !setorDescricao) {
      setMensagem("Por favor, preencha o nome do setor e a descrição.");
      return;
    }

    // 🚨 CORREÇÃO CRÍTICA:
    // O backend espera a chave 'setor' para o nome do setor, não 'nomeSetor'.
    const dadosAtualizados = {
      setor: setorNome, // <--- AJUSTADO PARA CORRESPONDER AO req.body.setor DO BACKEND
      descricao: setorDescricao,
    };

    try {
      // Requisição PUT para atualizar o setor
      await api.put(`/setores/${id}`, dadosAtualizados);
      // Atualiza o estado original e exibe a mensagem de sucesso
      setSetorOriginal((prev) => ({ ...prev, ...dadosAtualizados }));
      setMensagem(`Setor '${setorNome}' atualizado com sucesso!`);
      setErro(null);
    } catch (e) {
      const errorMsg =
        e.response?.data?.error || "Erro desconhecido ao salvar.";
      console.error(e);
      setMensagem("Falha ao atualizar setor: " + errorMsg);
    }
  };

  // --- Renderização Condicional ---
  if (loading)
    return <p className="msg-carregando">Carregando dados do setor...</p>;
  if (erro) return <p className="msg-erro">Erro: {erro}</p>;
  if (!setorOriginal)
    return <p className="msg-erro">Nenhum setor encontrado com este ID.</p>;

  // --- Formulário de Edição ---
  return (
    <Layout title={`Editar Setor: ${setorOriginal.nomeSetor}`}>
      <div className="form-container" style={{ marginTop: "20px" }}>
        <form onSubmit={handleSalvar}>
          <div className="form-group full-width">
            <label htmlFor="nomeSetor">
              Nome do Setor: <span className="required">*</span>
            </label>
            <input
              type="text"
              id="nomeSetor"
              name="nomeSetor" // Nome do input no HTML (não precisa ser alterado)
              value={setorNome}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group full-width">
            <label htmlFor="descricao">
              Descrição: <span className="required">*</span>
            </label>
            <textarea
              id="descricao"
              name="descricao"
              value={setorDescricao}
              onChange={handleInputChange}
              rows="4"
              required
            />
          </div>

          <div className="form-group full-width" style={{ marginTop: "30px" }}>
            <button
              type="submit"
              className="form-button primary-button full-width"
            >
              Salvar Alterações
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

export default EditarSetor;
