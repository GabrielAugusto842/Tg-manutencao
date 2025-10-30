import { FaUser, FaLock } from "react-icons/fa";
import { useState } from "react";
import "./Login.css";
import backgroundImage from "../../wallpaper-azul-papel-de-parede-azul-fundo-4.jpg";
import api from "../../Services/api.jsx";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    try {
      setErrorMessage("");
      const res = await api.post("/auth/login", { email, password });

      // Salva o token
      localStorage.setItem("token", res.data.token);

      // Salva todos os dados do usuário que você espera usar no Navbar
      const user = {
        id_usuario: res.data.user.id,
        nome: res.data.user.nome,
        email: res.data.user.email,
        cargo: res.data.user.cargo || "", // caso o backend não envie, deixa vazio
        setor: res.data.user.setor || "",
      };
      localStorage.setItem("user", JSON.stringify(user));

      window.location.href = "/home";
    } catch (error) {
      const status = error.response?.status;
      const msg = error.response?.data?.message || "Ocorreu um erro";
      setErrorMessage(msg); // mostra mensagem do backend

      // Exibe a mensagem do backend diretamente
      setErrorMessage(msg);

      // Limpeza de token só se for 403 (sessão expirada)
      if (status === 403) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    }
  };

  return (
    <div className="login-wrapper">
      <div
        className="App"
        style={{
          backgroundImage: `url(${backgroundImage})`,
          height: "100vh",
          width: "100vw",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="coluna-esquerda">
          <div className="company">
            <div className="logo-container">
              <img
                src="src/assets/logo-company1.png"
                alt="Logo da Empresa"
                className="logo"
              />
            </div>
            <div className="texto">
              <h2 translate="no">MAINTENANCE MANAGER</h2>
              <p>Simplificando sua manutenção com tecnologia e inovação</p>
            </div>
          </div>
        </div>

        <div className="coluna-direita">
          <div className="blocoLogin">
            <div className="container">
              <form onSubmit={handleSubmit}>
                <h1>Acesse o sistema</h1>
                <div className="input-field">
                  <input
                    type="email"
                    placeholder="E-mail"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="username"
                  />
                  <FaUser className="icon" />
                </div>
                <div className="input-field">
                  <input
                    type="password"
                    placeholder="Senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                  />
                  <FaLock className="icon" />
                </div>
                <div className="recall-forget">
                  <a href="#">Esqueci minha senha</a>
                </div>
                <button type="submit">Entrar</button>
                {errorMessage && (
                  <p className="text-red-500 text-sm whitespace-pre-line text-center mt-4 ">
                    {errorMessage}
                  </p>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
