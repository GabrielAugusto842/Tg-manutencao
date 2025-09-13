
import { useNavigate } from "react-router-dom";
import Sidebar from "../../componentes/Sidebar/Sidebar.jsx";
import Navbar from "../../componentes/Navbar/Navbar.jsx"
import "../../componentes/Navbar/Navbar.css"; 
import "../../componentes/Sidebar/Sidebar.css";
import "./Home.css";

function Home() {

  const navigate = useNavigate();
  

    const handleLogout = () => {
    navigate('/login');
  }

  return (

    <div>
      <Navbar />

    <div style={{ display: "flex" }}>
      {/* Sidebar */}
      <Sidebar />

      {/* Área principal */}
      <div style={{ flex: 1, padding: "20px" }}>
        <h1> Bem vindo a home</h1>

        <button onClick={handleLogout} className=" bg-blue-500 text-white mt-12 py-2 px-12 rounded-md hover:bg-blue-600">
          Logout
        </button>
      </div>
      </div>
    </div>
  );
}

export default Home;