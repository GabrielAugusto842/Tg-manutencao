import "./App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./assets/telas/Login/Login";
import Home from "./assets/telas/Home/Home";
import CadastrarOrdens from "./assets/telas/Ordens/CadastrarOrdens";
import VisualizarOrdens from "./assets/telas/Ordens/VisualizarOrdens";
import MinhasOrdens from "./assets/telas/Ordens/MinhasOrdens";
import CadastrarUsuario from "./assets/telas/Usuario/CadastrarUsuario";
import VisualizarUsuarios from "./assets/telas/Usuario/VisualizarUsuarios";
import CadastrarEquipamentos from "./assets/telas/Equipamento/CadastrarEquipamentos";
import VisualizarEquipamentos from "./assets/telas/Equipamento/VisualizarEquipamentos";
import Relatorios from "./assets/telas/Relatórios/Relatorios"
import { useTokenExpiration } from "./useTokenExpiration";
import Layout from "./assets/componentes/Layout/Layout";
import TrocarSenha from "./assets/telas/TrocarSenha";

function App() {

  useTokenExpiration();

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/trocar-senha" element={<TrocarSenha/>} />

        {/* Ordens */}
        <Route path="/ordens/cadastrar" element={<CadastrarOrdens />} />
        <Route path="/ordens/visualizar" element={<VisualizarOrdens />} />
        <Route path="/ordens/minhasos" element={<MinhasOrdens />} />

        {/* Usuários */}
        <Route path="/usuario/cadastrar" element={<CadastrarUsuario />} />
        <Route path="/usuario/visualizar" element={<VisualizarUsuarios />} />

        {/* Equipamentos */}
        <Route path="/equipamentos/cadastrar" element={<CadastrarEquipamentos />} />
        <Route path="/equipamentos/visualizar" element={<VisualizarEquipamentos />} />

        {/* Relatórios */}
        <Route path="/relatorios" element={<Relatorios />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
