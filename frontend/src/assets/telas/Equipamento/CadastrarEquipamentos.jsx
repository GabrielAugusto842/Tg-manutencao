import React, { useEffect, useState } from "react";
import Layout from "../../componentes/Layout/Layout";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import api from "../../Services/api.jsx";
import "../../telas/Equipamento/CadastrarEquipamentos.css";

function CadastrarEquipamentos() {
  const [nome, setNome] = useState("");
  const [marca, setMarca] = useState("");
  const [modelo, setModelo] = useState("");
  const [numero_serie, setNumeroSerie] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [tag, setTag] = useState("");
  const [producaoPorHora, setProducaoPorHora] = useState("");
  const [disponibilidadeMes, setDisponibilidadeMes] = useState("");
  const navigate = useNavigate();
  const [setorNome, setSetorNome] = useState("");
  const [idSetor, setIdSetor] = useState(null);
  const [opcoesSetor, setOpcoesSetor] = useState([]);

  useEffect(() => {
    const carregarSetores = async () => {
      try {
        const response = await api.get("/setores");

        const setoresFormatados = response.data.map((setor) => ({
          id: setor.idSetor,
          nome: setor.nomeSetor,
        }));

        setOpcoesSetor(setoresFormatados);
      } catch (error) {
        console.error("erro ao carregar setores:", error);
        setMensagem("Erro ao carregar lista de setores.");
      }
    };
    carregarSetores();
  }, []);

  const handleSetorChange = (e) => {
    const nomeSelecionado = e.target.value;
    setSetorNome(nomeSelecionado); // Salva o nome para exibição no campo

    const setorObj = opcoesSetor.find((op) => op.nome === nomeSelecionado);
    setIdSetor(setorObj ? setorObj.id : null); // Salva o ID para o envio
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!idSetor) {
      setMensagem("Por favor, selecione um setor.");
      return;
    }

    const dadosEquipamento = {
      nome,
      marca,
      modelo,
      idSetor: idSetor,
      numeroSerie: numero_serie,
      tag,
      producaoPorHora: Number(producaoPorHora),
      disponibilidadeMes: Number(disponibilidadeMes),
    };

    try {
      const response = await axios.post(
        "http://localhost:3002/api/maquina",
        dadosEquipamento
      );

      console.log("Equipamento cadastrado com sucesso:", response.data);
      setMensagem("Equipamento cadastrado com sucesso!");

      setTimeout(() => {
  navigate("/equipamentos/visualizar");
}, 1500);

      setNome("");
      setMarca("");
      setSetorNome("");
      setIdSetor(null);
      setModelo("");
      setTag("");
      setNumeroSerie("");
      setProducaoPorHora("");
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

  return (
    <Layout title="Cadastro de Máquinas">
      <div className="form-container-equipamentos">
        <form onSubmit={handleSubmit}>
          {/* LINHA 1: Nome e Marca (Duas Colunas) */}
          <div className="form-row-equipamentos">
            {/* Campo Nome */}
            <div className="form-group-equipamentos half-width-equipamentos">
              <label htmlFor="nome">
                Nome: <span className="required">*</span>
              </label>
              <input
                id="nome"
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Ex: Máquina de Solda TIG"
                required
              />
            </div>

            {/* Campo Marca */}
            <div className="form-group-equipamentos half-width-equipamentos">
              <label htmlFor="marca">
                Marca:<span className="required">*</span>
              </label>
              <input
                id="marca"
                type="text"
                value={marca}
                onChange={(e) => setMarca(e.target.value)}
                placeholder="Ex: Lincoln Electric"
                required
              />
            </div>
          </div>

          {/* LINHA 2: Modelo e Setor (Duas Colunas) */}
          <div className="form-row-equipamentos">
            {/* Campo Modelo */}
            <div className="form-group-equipamentos half-width-equipamentos">
              <label htmlFor="modelo">
                Modelo: <span className="required">*</span>
              </label>
              <input
                id="modelo"
                type="text"
                value={modelo}
                onChange={(e) => setModelo(e.target.value)}
                placeholder="Ex: Invertec V205-T"
                required
              />
            </div>

            {/* Campo Setor */}
            <div className="form-group-equipamentos half-width-equipamentos">
              <label htmlFor="setor">
                Setor:<span className="required">*</span>
              </label>
              <select
                id="setor"
                value={setorNome}
                onChange={handleSetorChange}
                required
              >
                <option value="" disabled>
                  Selecione um setor...
                </option>

                {/* Renderiza as opções do setor */}
                {opcoesSetor.map((opcao) => (
                  <option key={opcao.id} value={opcao.nome}>
                    {opcao.nome}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* LINHA 3: Número de Série e TAG (Duas Colunas) */}
          <div className="form-row-equipamentos">
            {/* Campo Número de Série */}
            <div className="form-group-equipamentos half-width-equipamentos">
              <label htmlFor="numero_serie">
                Nº de Série: <span className="required">*</span>
              </label>
              <input
                id="numero_serie"
                type="text"
                value={numero_serie}
                onChange={(e) => setNumeroSerie(e.target.value)}
                placeholder="Informe o número de série"
                required
              />
            </div>

            {/* Campo TAG */}
            <div className="form-group-equipamentos half-width-equipamentos">
              <label htmlFor="tag">
                TAG/ID Interno: <span className="required">*</span>
              </label>
              <input
                id="tag"
                type="text"
                value={tag}
                onChange={(e) => setTag(e.target.value)}
                placeholder="Ex: EQ-001 ou 123a"
                required
              />
            </div>
          </div>
          <div className="form-group-equipamentos half-width-equipamentos">
            <label htmlFor="producaoPorHora">
              Produção Por Hora (Opcional)
              <span
                className="tooltip-icon"
                data-tooltip="Quantidade que a máquina produz por hora de operação."
              >
                i
              </span>
            </label>

            <input
              id="producaoPorHora"
              type="number"
              value={producaoPorHora}
              onChange={(e) => setProducaoPorHora(e.target.value)}
              placeholder="Ex: 500"
            />
          </div>

          <div className="form-group-equipamentos half-width-equipamentos">
            <label htmlFor="disponibilidadeMes">
              Disponibilidade no Mês (horas)
              <span
                className="tooltip-icon"
                data-tooltip="Total de horas disponíveis para uso no mês. Normalmente 160 para turno de 8h / 5 dias."
              >
                i
              </span>
            </label>

            <input
              id="disponibilidadeMes"
              type="number"
              value={disponibilidadeMes}
              onChange={(e) => setDisponibilidadeMes(e.target.value)}
              placeholder="Ex: 160"
              required
            />
          </div>

          {/* Botão de Submissão */}
          <div
            className="form-group-equipamentos full-width-equipamentos"
            style={{ marginTop: "30px" }}
          >
            <button
              type="submit"
              className="form-button-equipamentos primary-button full-width-equipamentos"
            >
              Cadastrar Equipamento
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

export default CadastrarEquipamentos;
