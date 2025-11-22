import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import Layout from "../../componentes/Layout/Layout";
import api from "../../Services/api.jsx";
import "./EditarEquipamento.css";

function EditarEquipamento() {
  const { id } = useParams();

  const API_SETORES = "http://localhost:3002/api/setores";

  // Estados
  const [equipamento, setEquipamento] = useState(null);
  const [dadosFormulario, setDadosFormulario] = useState({
    nome: "",
    marca: "",
    modelo: "",
    numero_serie: "",
    tag: "",
    producaoPorHora: "",
  });
  const [idSetor, setIdSetor] = useState(null);
  const [opcoesSetor, setOpcoesSetor] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);

  // Handler genérico de input
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setDadosFormulario((prev) => ({ ...prev, [name]: value }));
  };

  // Buscar equipamento
  const buscarEquipamento = useCallback(async () => {
    try {
      const res = await api.get(`/maquina/${id}`);
      setEquipamento(res.data);
      setIdSetor(res.data.id_setor);
      setDadosFormulario({
        nome: res.data.nome || "",
        marca: res.data.marca || "",
        modelo: res.data.modelo || "",
        numero_serie: res.data.numero_serie || "",
        tag: res.data.tag || "",
        producaoPorHora: res.data.producaoPorHora || "",
      });
    } catch (e) {
      setErro("Erro ao carregar equipamento.");
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [id]);

  // Buscar setores
  const carregarSetores = useCallback(async () => {
    try {
      const res = await fetch(API_SETORES, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const data = await res.json();
      const formatados = data
        .map((s) => ({ id: s.idSetor, nome: s.nomeSetor }))
        .filter((v, i, a) => a.findIndex((t) => t.id === v.id) === i); // Remove duplicados
      setOpcoesSetor(formatados);
    } catch (err) {
      console.error("Erro ao carregar setores:", err);
    }
  }, []);

  // Carregar tudo ao montar
  useEffect(() => {
    buscarEquipamento();
    carregarSetores();
  }, [buscarEquipamento, carregarSetores]);

  const handleSalvar = async (e) => {
    e.preventDefault();
    try {
      // 1. Trata producaoPorHora: Converte para Número ou usa null.
      // O nome da chave 'producaoPorHora' está em camelCase no estado, então vamos usá-lo.
      const producao =
        dadosFormulario.producaoPorHora.trim() !== ""
          ? Number(dadosFormulario.producaoPorHora)
          : null;

      // 2. Trata idSetor: Garante que é um número ou null.
      const setorId = idSetor !== null ? Number(idSetor) : null;

      const dadosAtualizados = {
        // Campos de string
        nome: dadosFormulario.nome,
        marca: dadosFormulario.marca,
        modelo: dadosFormulario.modelo || null,

        // MUDANÇA CRUCIAL 1: Ajusta a chave para camelCase para coincidir com o Repository/Controller
        numeroSerie: dadosFormulario.numero_serie,

        tag: dadosFormulario.tag || null,

        // O nome da chave no payload deve ser o mesmo esperado pelo Controller/Repository
        producaoPorHora: producao,

        // MUDANÇA CRUCIAL 2: Ajusta a chave para camelCase para coincidir com o Repository/Controller
        idSetor: setorId,
      };

      console.log("Enviando dados:", dadosAtualizados); // VERIFIQUE ESTE LOG!

      await api.put(`/maquina/${id}`, dadosAtualizados);

      alert("Equipamento atualizado com sucesso!");
    } catch (error) {
      console.error("Falha na atualização:", error);
      // Tente logar a resposta do erro se possível para obter a mensagem de validação
      alert("Falha ao atualizar equipamento.");
    }
  };

  if (loading) return <p>Carregando dados do equipamento...</p>;
  if (erro) return <p style={{ color: "red" }}>{erro}</p>;
  if (!equipamento) return <p>Equipamento não encontrado.</p>;

  return (
    <Layout title={`Editar Equipamento: ${equipamento.nome}`}>
      <div className="edicao-equipamento-container">
        <form onSubmit={handleSalvar} className="edicao-equipamento-form">
          <label>
            Nome:
            <input
              type="text"
              name="nome"
              value={dadosFormulario.nome}
              onChange={handleInputChange}
            />
          </label>

          <label>
            Marca:
            <input
              type="text"
              name="marca"
              value={dadosFormulario.marca}
              onChange={handleInputChange}
            />
          </label>

          <label>
            Modelo:
            <input
              type="text"
              name="modelo"
              value={dadosFormulario.modelo}
              onChange={handleInputChange}
            />
          </label>

          <label>
            Número de Série:
            <input
              type="text"
              name="numero_serie"
              value={dadosFormulario.numero_serie}
              onChange={handleInputChange}
            />
          </label>

          <label>
            Tag:
            <input
              type="text"
              name="tag"
              value={dadosFormulario.tag}
              onChange={handleInputChange}
            />
          </label>

          <label>
            Produção por Hora:
            <input
              type="number"
              name="producaoPorHora"
              value={dadosFormulario.producaoPorHora}
              onChange={handleInputChange}
            />
          </label>

          <label>
            Setor:
            <select
              value={idSetor || ""}
              onChange={(e) => setIdSetor(Number(e.target.value))}
            >
              <option value="">Selecione um setor</option>
              {opcoesSetor.map((setor) => (
                <option key={setor.id} value={setor.id}>
                  {setor.nome}
                </option>
              ))}
            </select>
          </label>

          <button type="submit">Salvar Edição</button>
        </form>
      </div>
    </Layout>
  );
}

export default EditarEquipamento;
