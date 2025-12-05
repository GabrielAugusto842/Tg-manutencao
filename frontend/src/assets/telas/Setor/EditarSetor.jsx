import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "../../componentes/Layout/Layout";
import api from "../../Services/api.jsx";
import "../../telas/Setor/EditarSetor.css";

function EditarSetor() {
  const { id } = useParams();

  const [setorNome, setSetorNome] = useState("");
  const [setorDescricao, setSetorDescricao] = useState("");
  const [setorOriginal, setSetorOriginal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);
  const [mensagem, setMensagem] = useState("");
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "nomeSetor") {
      setSetorNome(value);
    } else if (name === "descricao") {
      setSetorDescricao(value);
    }
  };

  useEffect(() => {
    const buscarSetor = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/setores/${id}`);
        const dados = res.data;

        setSetorOriginal(dados);
        setSetorNome(dados.nomeSetor || "");
        setSetorDescricao(dados.descricao || "");
      } catch (e) {
        setErro("Erro ao buscar setor: " + (e.response?.data?.error || e.message));
      } finally {
        setLoading(false);
      }
    };

    buscarSetor();
  }, [id]);

  const handleSalvar = async (e) => {
    e.preventDefault();
    setMensagem("");

    if (!setorNome || !setorDescricao) {
      setMensagem("Por favor, preencha o nome do setor e a descrição.");
      return;
    }

    const dadosAtualizados = {
      setor: setorNome,
      descricao: setorDescricao,
    };

try {
  setErro(null); // Limpa erro antigo
  await api.put(`/setores/${id}`, dadosAtualizados);

  setSetorOriginal((prev) => ({ ...prev, ...dadosAtualizados }));
  setMensagem(`Setor '${setorNome}' atualizado com sucesso!`);

  setTimeout(() => {
    navigate("/setores/visualizar");
  }, 1500);

} catch (e) {
  const errorMsg = e.response?.data?.error || "Erro desconhecido ao salvar.";
  setMensagem("Falha ao atualizar setor: " + errorMsg);
}


  };

  if (loading) return <p className="msg-carregando">Carregando dados do setor...</p>;
  if (erro) return <p className="msg-erro">Erro: {erro}</p>;
  if (!setorOriginal) return <p className="msg-erro">Nenhum setor encontrado com este ID.</p>;

  return (
    <Layout title={`Editar Setor: ${setorOriginal.nomeSetor}`}>
      <div className="editar-setor-container">

        <form className="editar-setor-form" onSubmit={handleSalvar}>

          <div className="form-group full-width">
            <label htmlFor="nomeSetor">
              Nome do Setor: <span className="required">*</span>
            </label>
            <input
              type="text"
              id="nomeSetor"
              name="nomeSetor"
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

          <button type="submit" className="botao-salvar-setor">
            Salvar Alterações
          </button>

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
