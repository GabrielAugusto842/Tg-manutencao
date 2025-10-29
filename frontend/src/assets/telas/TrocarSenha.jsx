import React, { useState } from "react";
import { useNavigate } from "react-router-dom";


const TrocarSenha = () => {
  const navigate = useNavigate();
  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmNovaSenha, setConfirmNovaSenha] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro("");
    setMensagem("");

    // Validações simples
    if (!senhaAtual || !novaSenha || !confirmNovaSenha) {
      setErro("Todos os campos são obrigatórios.");
      return;
    }

    if (novaSenha !== confirmNovaSenha) {
      setErro("A nova senha e a confirmação não coincidem.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:3002/trocar-senha", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          senhaAtual,
          novaSenha,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Erro ao trocar senha.");
      }

      setMensagem("Senha alterada com sucesso!");
      // Opcional: redirecionar para outra página
      setTimeout(() => navigate("/"), 2000);
    } catch (err) {
      setErro(err.message);
    }
  };

  return (
    <div className="trocar-senha-container">
      <h2>Trocar Senha</h2>
      <form onSubmit={handleSubmit} className="trocar-senha-form">
        <label>
          Senha Atual:
          <input
            type="password"
            value={senhaAtual}
            onChange={(e) => setSenhaAtual(e.target.value)}
          />
        </label>

        <label>
          Nova Senha:
          <input
            type="password"
            value={novaSenha}
            onChange={(e) => setNovaSenha(e.target.value)}
          />
        </label>

        <label>
          Confirmar Nova Senha:
          <input
            type="password"
            value={confirmNovaSenha}
            onChange={(e) => setConfirmNovaSenha(e.target.value)}
          />
        </label>

        <button type="submit">Trocar Senha</button>
      </form>

      {mensagem && <p className="mensagem-sucesso">{mensagem}</p>}
      {erro && <p className="mensagem-erro">{erro}</p>}
    </div>
  );
};

export default TrocarSenha;
