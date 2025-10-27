import React, { useState } from "react";
// Assumindo que o caminho corrigido seja: "../../assets/Services/api.jsx"
import api from "../../assets/Services/api.jsx";
import { useNavigate } from "react-router-dom";

const TrocarSenhaPage = () => {
  // CORREÇÃO 1: Incluir os setters para Nova Senha e Confirmação
  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState(""); // CORRIGIDO: Adicionado setNovaSenha
  const [confirmarSenha, setConfirmarSenha] = useState(""); // CORRIGIDO: Adicionado setConfirmarSenha
  const [mensagem, setMensagem] = useState("");
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  // CORREÇÃO 2: Mover handleLogout para o escopo correto (fora do handleSubmit)
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validação adicional: Garantir que a nova senha tenha um tamanho mínimo
    if (novaSenha.length < 6) {
      setMensagem("A nova senha deve ter pelo menos 6 caracteres.");
      setIsLoading(false);
      return;
    }

    if (novaSenha !== confirmarSenha) {
      setMensagem("A nova senha e a confirmação não coincidem.");
      setIsLoading(false);
      return;
    }

    // Se as validações passarem, inicia o processo
    setMensagem("");
    setIsLoading(true);

    try {
      const res = await api.put("/user/trocar-senha", {
        senhaAtual,
        novaSenha,
      });

      // Usar a mensagem retornada pelo backend
      setMensagem(res.data.message || "Senha alterada com sucesso.");

      if (res.data.forceLogout) {
        setTimeout(() => {
          handleLogout();
        }, 2000);
      } else {
        navigate("/home");
      }
    } catch (error) {
      console.error("Erro de troca de senha:", error);
      setMensagem(
        error.response?.data?.message || "Erro ao conectar. Tente novamente."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="trocar-senha-container">
      <div className="trocar-senha-content">
        <h2>Trocar Senha</h2>
        <form onSubmit={handleSubmit}>
          {/* CAMPO SENHA ATUAL (Já estava correto) */}
          <input
            type="password"
            placeholder="Senha Atual"
            value={senhaAtual}
            onChange={(e) => setSenhaAtual(e.target.value)}
            required
            disabled={isLoading}
          />

          {/* CAMPO NOVA SENHA (CORRIGIDO) */}
          <input
            type="password"
            placeholder="Nova Senha"
            value={novaSenha}
            onChange={(e) => setNovaSenha(e.target.value)} // <--- USO DO NOVO SETTER
            required
            disabled={isLoading}
          />

          {/* CAMPO CONFIRMAR SENHA (CORRIGIDO) */}
          <input
            type="password"
            placeholder="Confirme a Nova Senha"
            value={confirmarSenha}
            onChange={(e) => setConfirmarSenha(e.target.value)} // <--- USO DO NOVO SETTER
            required
            disabled={isLoading}
          />

          {mensagem && <p className="page-message">{mensagem}</p>}

          <div className="page-actions">
            <button
              type="button"
              onClick={() => navigate(-1)}
              disabled={isLoading}
              className="btn-cancel"
            >
              Voltar
            </button>
            <button type="submit" disabled={isLoading} className="btn-submit">
              {isLoading ? "Processando..." : "Confirmar Troca"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TrocarSenhaPage;
