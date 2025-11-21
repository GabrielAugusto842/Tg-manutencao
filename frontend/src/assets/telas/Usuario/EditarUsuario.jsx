import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import Layout from "../../componentes/Layout/Layout";

const API_URL = "http://localhost:3002/api/user";
const API_CARGOS = "http://localhost:3002/api/cargo";
const API_SETORES = "http://localhost:3002/api/setores";

function EditarUsuario() {
  const { id } = useParams();

  // Estados
  const [usuario, setUsuario] = useState(null);
  const [dadosFormulario, setDadosFormulario] = useState({
    nome: "",
    email: "",
    novaSenha: "",
  });

  const [idCargo, setIdCargo] = useState(null);
  const [idSetor, setIdSetor] = useState(null);
  const [opcoesCargo, setOpcoesCargo] = useState([]);
  const [opcoesSetor, setOpcoesSetor] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);

  // Handler genérico de input
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setDadosFormulario((prev) => ({ ...prev, [name]: value }));
  };

  // Fetch usuário
  const buscarUsuario = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/id/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (!res.ok) throw new Error("Usuário não encontrado.");
      const dados = await res.json();
      setUsuario(dados);
      setIdCargo(dados.id_cargo);
      setIdSetor(dados.id_setor);
      setDadosFormulario({ nome: dados.nome || "", email: dados.email || "" });
    } catch (e) {
      setErro(e.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  // Fetch cargos
  const carregarCargos = useCallback(async () => {
    try {
      const res = await fetch(API_CARGOS, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const data = await res.json();
      const formatados = data.map((c) => ({ id: c.idCargo, nome: c.cargo }));
      setOpcoesCargo(formatados);
    } catch (err) {
      console.error("Erro ao carregar cargos:", err);
    }
  }, []);

  // Fetch setores
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
    buscarUsuario();
    carregarCargos();
    carregarSetores();
  }, [buscarUsuario, carregarCargos, carregarSetores]);

  // Salvar alterações
  const handleSalvar = async (e) => {
    e.preventDefault();
    try {
      // 1. Extrai os valores do formulário. Usa || "" como segurança, embora o estado deva ter "novaSenha": ""
      const nome = dadosFormulario.nome || "";
      const email = dadosFormulario.email || "";
      const novaSenha = dadosFormulario.novaSenha || ""; // 2. Monta o objeto de dados *limpo*

      const dadosAtualizados = {
        nome: nome,
        email: email,
        id_cargo: idCargo,
        id_setor: idSetor,
      }; // 3. Adiciona a senha APENAS se o campo foi preenchido.

      if (novaSenha.trim() !== "") {
        // O backend espera o campo 'senha', não 'novaSenha'
        dadosAtualizados.senha = novaSenha;
      } // 4. Requisição PUT

      const res = await fetch(`${API_URL}/id/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(dadosAtualizados),
      });

      if (!res.ok) {
        const errorData = await res
          .json()
          .catch(() => ({ error: "Erro desconhecido" }));
        throw new Error(errorData.error || "Erro ao salvar usuário.");
      }

      alert("Usuário atualizado com sucesso!");
    } catch (e) {
      console.error(e);
      alert("Falha ao atualizar usuário: " + e.message);
    }
  };

  // Render
  if (loading) return <p>Carregando dados do usuário...</p>;
  if (erro) return <p style={{ color: "red" }}>Erro: {erro}</p>;
  if (!usuario) return <p>Nenhum usuário encontrado com este ID.</p>;

  return (
    <Layout title={`Editar Usuário: ${usuario.nome}`}>
      <form onSubmit={handleSalvar}>
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
          Email:
          <input
            type="text"
            name="email"
            value={dadosFormulario.email}
            onChange={handleInputChange}
          />
        </label>

        <label>
          Nova Senha (opcional):
          <input
            type="password"
            name="novaSenha" // Use o mesmo nome do estado
            value={dadosFormulario.novaSenha}
            onChange={handleInputChange}
            placeholder="Deixe vazio para não alterar"
          />
        </label>

        <label>
          Cargo:
          <select
            value={idCargo || ""}
            onChange={(e) => setIdCargo(Number(e.target.value))}
          >
            <option value="">Selecione um cargo</option>
            {opcoesCargo.map((cargo) => (
              <option key={cargo.id} value={cargo.id}>
                {cargo.nome}
              </option>
            ))}
          </select>
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
    </Layout>
  );
}

export default EditarUsuario;
