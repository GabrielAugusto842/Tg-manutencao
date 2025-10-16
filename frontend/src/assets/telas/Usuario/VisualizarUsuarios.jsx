import React, { useState, useEffect } from "react";
import Layout from "../../componentes/Layout/Layout";
import "../../telas/Usuario/VisualizarUsuarios.css"

// URL de exemplo de uma API pública para buscar usuários (JSONPlaceholder)
const API_URL = "http://localhost:3001/api/user";

function VisualizarUsuariosContent() {

  const [usuarios, setUsuarios] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  const handleInativar = (id) => {
        console.log(`Inativar usuário com ID: ${id}`);
        // Implemente a chamada PATCH/PUT ao back-end aqui
    };

  const handleDeletar = (id) => {
        if (window.confirm(`Tem certeza que deseja DELETAR o usuário ${id}?`)) {
            console.log(`Deletar usuário com ID: ${id}`);
            // Implemente a chamada DELETE ao back-end aqui
        }
    };

  useEffect(() => {
    async function buscarUsuarios() {
      try {
        setCarregando(true); 
        setErro(null);      
        
        const resposta = await fetch(API_URL);

        if (!resposta.ok) {
          throw new Error(`Erro ao buscar dados: ${resposta.statusText}`);
        }

        const dados = await resposta.json();
        setUsuarios(dados); // Armazena a lista de usuários
      } catch (e) {

        // Captura erros de rede ou de resposta HTTP
        setErro("Não foi possível carregar os usuários. Verifique sua conexão ou a API.");
        console.error("Erro na busca de usuários:", e);
      } finally {
        setCarregando(false); // Finaliza o carregamento
      }
    }

    buscarUsuarios();
  }, []); 
  

  if (carregando) {
        return <h1>Carregando usuários...</h1>;
    }

    if (erro) {
        return (
            <div className="container" style={{ color: 'red' }}>
                <p>{erro}</p>
            </div>
        );
    }
    
    // RENDERIZAÇÃO DO CONTEÚDO FINAL
    return (
        <div className="container">
            {usuarios.length === 0 ? (
                <p>Nenhum usuário cadastrado.</p>
            ) : (
                <ul className="lista-usuarios">
                    {usuarios.map(usuario => (
                        <li key={usuario.idUsuario} className="item-usuario">
                            <div className="dados-usuario">
                                <strong>ID:</strong> {usuario.idUsuario} | 
                                <strong> Nome:</strong> {usuario.nome} | 
                                <strong> Email:</strong> {usuario.email}
                            </div>
                            <div className="acoes-usuario">
                                <button 
                                    className="btn-inativar" 
                                    onClick={() => handleInativar(usuario.idUsuario)}
                                >
                                    Inativar
                                </button>
                                <button 
                                    className="btn-deletar"
                                    onClick={() => handleDeletar(usuario.idUsuario)}
                                >
                                    Deletar
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

// ----------------------------------------------------
// COMPONENTE WRAPPER (Exportado)
// ----------------------------------------------------

export default function VisualizarUsuarios() {
    return (
        <Layout title="Visualizar Usuários"> 
            <VisualizarUsuariosContent />
        </Layout>
    );
}