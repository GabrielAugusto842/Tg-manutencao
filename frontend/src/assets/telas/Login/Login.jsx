import { FaUser, FaLock } from "react-icons/fa";
import { useState } from "react";
import "./Login.css";
import backgroundImage from "../../wallpaper-azul-papel-de-parede-azul-fundo-4.jpg"; // Caminho correto
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState('');


  const navigate = useNavigate();

  const handleSubmit = (event) => {
    event.preventDefault();
    navigate("/home");
    //alert("Enviando os dados: " + username + " - " + password);
  };

  return (
    <div className="login-wrapper">
      <div
        className="App"
        style={{ backgroundImage: `url(${backgroundImage})`,
        height: "100vh",
        width: "100vw",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat", }}
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
                  />
                  <FaLock className="icon" />
                </div>

                <div className="recall-forget">
                  <a href="#">Esqueci minha senha</a>
                </div>

                <button type="submit">Entrar</button>
                {errorMessage && <p className="text-red-500 text-sm whitespace-pre-line text-center mt-4 ">{errorMessage}</p>} {/* Display error message if exists */}
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;