import { useState } from "react";
import api from "../Services/api.jsx";
import "../telas/TrocarSenha.css";

const TrocarSenha = () => {
  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro("");
    setMensagem("");

    if (novaSenha !== confirmarSenha) {
      setErro("As senhas novas são diferentes.");
      return;
    }

    try {
      const res = await api.put("/auth/trocar-senha", {
        senhaAtual,
        novaSenha,
      });

      setMensagem(res.data.message || "Senha alterada com sucesso!");

      localStorage.removeItem("token");
      localStorage.removeItem("user");

      setTimeout(() => {
        window.location.href = "/login";
      }, 2000);

      setSenhaAtual("");
      setNovaSenha("");
      setConfirmarSenha("");
    } catch (error) {
      const msg = error.response?.data?.message || "Erro ao trocar a senha.";
      setErro(msg);
    }
  };

  return (
    <div className="trocar-senha-container">
      <h2>Trocar Senha</h2>
      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <label>Senha Atual</label>
          <input
            type="password"
            value={senhaAtual}
            onChange={(e) => setSenhaAtual(e.target.value)}
            required
          />
        </div>

        <div className="input-group">
          <label>Nova Senha</label>
          <input
            type="password"
            value={novaSenha}
            onChange={(e) => setNovaSenha(e.target.value)}
            required
          />
        </div>

        <div className="input-group">
          <label>Confirmar Nova Senha</label>
          <input
            type="password"
            value={confirmarSenha}
            onChange={(e) => setConfirmarSenha(e.target.value)}
            required
          />
        </div>

        <button type="submit">Salvar</button>

        {mensagem && <p className="success">{mensagem}</p>}
        {erro && <p className="error">{erro}</p>}
      </form>
    </div>
  );
};

export default TrocarSenha;
