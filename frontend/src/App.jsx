import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./componentes/Login/Login";
import Home from "./componentes/Home/Home";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/home" element={<Home />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
