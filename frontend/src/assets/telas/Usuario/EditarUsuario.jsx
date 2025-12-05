import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "../../componentes/Layout/Layout";
import api from "../../Services/api.jsx";
import "../../telas/Setor/EditarSetor.css";

function EditarSetor() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Estado do formulário
  const [dadosFormulario, setDadosFormulario] = useState({
    nomeSetor: "",
    descricao: "",
  });

  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setDadosFormulario((prev) => ({ ...prev, [name]: value }));
  };

  const buscarSetor = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(`/setores/${id}`);
      setDadosFormulario({
        nomeSetor: res.data.nomeSetor || "",
        descricao: res.data.descricao || "",
      });
    } catch (e) {
      setErro("Erro ao buscar setor: " + (e.response?.data?.error || e.message));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    buscarSetor();
  }, [buscarSetor]);

  const handleSalvar = async (e) => {
    e.preventDefault();
    setErro(null);

    if (!dadosFormulario.nomeSetor || !dadosFormulario.descricao) {
      alert("Por favor, preencha o nome do setor e a descrição.");
      return;
    }

    const dadosAtualizados = {
      setor: dadosFormulario.nomeSetor,
      descricao: dadosFormulario.descricao,
    };

    try {
      console.log("Enviando dados:", dadosAtualizados);
      await api.put(`/setores/${id}`, dadosAtualizados);

      alert(`Setor '${dadosFormulario.nomeSetor}' atualizado com sucesso!`);
      navigate("/setores/visualizar");
    } catch (e) {
      console.error("Falha na atualização:", e);
      alert("Falha ao atualizar setor: " + (e.response?.data?.error || "Erro desconhecido"));
    }
  };

  if (loading) return <p className="msg-carregando">Carregando dados do setor...</p>;
  if (erro) return <p className="msg-erro">{erro}</p>;

  return (
    <Layout title={`Editar Setor: ${dadosFormulario.nomeSetor}`}>
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
              value={dadosFormulario.nomeSetor}
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
              value={dadosFormulario.descricao}
              onChange={handleInputChange}
              rows="4"
              required
            />
          </div>

          <button type="submit" className="botao-salvar-setor">
            Salvar Alterações
          </button>
        </form>
      </div>
    </Layout>
  );
}

export default EditarSetor;
