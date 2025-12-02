import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "../../componentes/Layout/Layout";
import api from "../../Services/api";
import "./EditarOS.css"; // Estilos para a página de edição

function EditarOS() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Definição das variáveis de estado
  const [ordemServico, setOrdemServico] = useState(null);
  const [dadosFormulario, setDadosFormulario] = useState({
    descricao: "",
    manutentor: "",
    solucao: "",
    custo: "",
  });
  const [manutentores, setManutentores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);

  // Buscar Ordem de Serviço
  const buscarOrdemServico = useCallback(async () => {
    try {
      const res = await api.get(`/os/${id}`);
      setOrdemServico(res.data);
      setDadosFormulario({
        descricao: res.data.descricao || "",
        manutentor: res.data.idUsuario || "", // O ID do usuário que é o manutentor
        solucao: res.data.solucao || "",
        custo: res.data.custo || "",
      });

      // Se a ordem estiver em andamento, busca a lista de manutentores
      if (res.data.status === "Em andamento") {
        buscarManutentores();
      }
    } catch (e) {
      setErro("Erro ao carregar a ordem de serviço.");
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [id]);

  // Buscar a lista de manutentores
  const buscarManutentores = async () => {
    try {
      const res = await api.get("/user/manutentores");
      setManutentores(res.data);
    } catch (e) {
      console.error("Erro ao carregar manutentores:", e);
      setErro("Erro ao buscar manutentores.");
    }
  };

  // Carregar os dados da O.S. ao montar o componente
  useEffect(() => {
    buscarOrdemServico();
  }, [buscarOrdemServico]);

  // Função para salvar a O.S.
  // Função para salvar a O.S.
  const handleSalvar = async (e) => {
    e.preventDefault();

    // Trata o custo
    const custoTratado =
      dadosFormulario.custo === "" ? null : Number(dadosFormulario.custo);

    // Monta objeto com os campos que podem ser alterados
    const dadosAtualizados = {};

    if (ordemServico.status === "Aberta") {
      dadosAtualizados.descricao = dadosFormulario.descricao;
    } else if (ordemServico.status === "Em andamento") {
      dadosAtualizados.descricao = dadosFormulario.descricao;
      dadosAtualizados.idUsuario = Number(dadosFormulario.manutentor);
    } else if (ordemServico.status === "Finalizado") {
      dadosAtualizados.descricao = dadosFormulario.descricao;
      dadosAtualizados.solucao = dadosFormulario.solucao;
      dadosAtualizados.custo = custoTratado;
    }

    try {
      await api.put(`/os/${id}`, dadosAtualizados);
      alert("Ordem de serviço atualizada com sucesso!");
      navigate(`/ordens/visualizar/`);
    } catch (error) {
      console.error("Falha na atualização:", error);
      alert("Falha ao atualizar ordem de serviço.");
    }
  };

  // Exibe um carregamento ou mensagem de erro
  if (loading) return <p>Carregando dados da O.S...</p>;
  if (erro) return <p style={{ color: "red" }}>{erro}</p>;
  if (!ordemServico) return <p>Ordem de serviço não encontrada.</p>;

  // Define o estado de edição baseado no status da O.S.
  const isAberta = ordemServico.status === "Aberta";
  const isEmAndamento = ordemServico.status === "Em andamento";
  const isFinalizada = ordemServico.status === "Finalizado";

  // Desabilita os campos conforme as regras
  const descricaoDisabled = false; // Descrição sempre pode ser editada
  const manutentorDisabled = !isEmAndamento; // Manutentor só pode ser editado se "Em andamento"
  const solucaoDisabled = !isFinalizada; // Solução só pode ser editada se "Finalizado"
  const custoDisabled = !isFinalizada; // Custo só pode ser editado se "Finalizado"

  // Extraindo o manutentor atual com base no idUsuario
  const manutentorAtual = manutentores.find(
    (manutentor) => manutentor.id_usuario === ordemServico.idUsuario
  );

  return (
    <Layout title={`Editar O.S. - ${ordemServico.id}`}>
      <div className="edicao-os-container">
        <form onSubmit={handleSalvar} className="edicao-os-form">
          <div className="form-grid">
            <h2>{`${ordemServico.nomeMaquina} - ${ordemServico.setor}`}</h2>

            {/* Exibe o status da O.S. */}
            <p>
              <strong>Status: </strong>
              <span
                className={
                  isAberta
                    ? "status-aberta"
                    : isEmAndamento
                    ? "status-em-andamento"
                    : isFinalizada
                    ? "status-finalizada"
                    : ""
                }
              >
                {ordemServico.status}
              </span>
            </p>

            {/* Descrição */}
            <label style={{ color: descricaoDisabled ? "#9e9e9e" : "#414852" }}>
              Descrição:
              <textarea
                name="descricao"
                value={dadosFormulario.descricao}
                onChange={(e) =>
                  setDadosFormulario({
                    ...dadosFormulario,
                    descricao: e.target.value,
                  })
                }
                disabled={descricaoDisabled}
              />
              {isAberta && !dadosFormulario.descricao && (
                <p className="aviso">O.S. aberta, dados não preenchidos.</p>
              )}
            </label>

            {/* Solução */}
            <label style={{ color: solucaoDisabled ? "#9e9e9e" : "#414852" }}>
              Solução:
              <textarea
                name="solucao"
                value={dadosFormulario.solucao}
                onChange={(e) =>
                  setDadosFormulario({
                    ...dadosFormulario,
                    solucao: e.target.value,
                  })
                }
                disabled={solucaoDisabled}
              />
              {isFinalizada && !dadosFormulario.solucao && (
                <p className="aviso">O.S. finalizada, dados não preenchidos.</p>
              )}
            </label>

            {/* Custo */}
            <label style={{ color: custoDisabled ? "#9e9e9e" : "#414852" }}>
              Custo:
              <input
                type="number"
                name="custo"
                value={dadosFormulario.custo}
                onChange={(e) =>
                  setDadosFormulario({
                    ...dadosFormulario,
                    custo: e.target.value,
                  })
                }
                disabled={custoDisabled}
              />
              {isFinalizada && !dadosFormulario.custo && (
                <p className="aviso">O.S. finalizada, dados não preenchidos.</p>
              )}
            </label>

            {/* Manutentor Atual */}
            <label
              style={{ color: manutentorDisabled ? "#9e9e9e" : "#414852" }}
            >
              <p>
                {manutentorAtual
                  ? `Manutentor Atual: ${manutentorAtual.nome}` // Exibe o nome do manutentor
                  : "Nenhum manutentor atribuído"}{" "}
                {/* Se não houver manutentor, exibe uma mensagem */}
              </p>
              <select
                name="manutentor"
                value={dadosFormulario.manutentor} // ID do manutentor
                onChange={(e) => {
                  const novoManutentor = e.target.value;
                  setDadosFormulario({
                    ...dadosFormulario,
                    manutentor: novoManutentor, // Atualiza o ID do manutentor
                  });
                }}
                disabled={manutentorDisabled}
              >
                <option value="">Selecionar Manutentor</option>
                {manutentores.map((manutentor) => (
                  <option
                    key={manutentor.id_usuario}
                    value={manutentor.id_usuario}
                  >
                    {manutentor.nome}
                  </option>
                ))}
              </select>
              {isEmAndamento && !dadosFormulario.manutentor && (
                <p className="aviso">
                  O.S. em andamento, dados não preenchidos.
                </p>
              )}
            </label>
          </div>

          <button type="submit">Salvar Alterações</button>
        </form>
      </div>
    </Layout>
  );
}

export default EditarOS;
