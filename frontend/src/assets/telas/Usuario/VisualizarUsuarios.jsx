import React, { useState, useEffect } from "react";
import Layout from "../../componentes/Layout/Layout";
import "../../telas/Usuario/VisualizarUsuarios.css"

// URL base da API
const API_URL = "http://localhost:3001/api/user";

function VisualizarUsuariosContent() {

    const [usuarios, setUsuarios] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState(null);
    const [mensagemSucesso, setMensagemSucesso] = useState(null); // Novo estado para feedback

    // Função para buscar usuários (refatorada para ser reutilizada)
    const buscarUsuarios = async () => {
        try {
            setCarregando(true);
            setErro(null);
            setMensagemSucesso(null);

            const resposta = await fetch(API_URL);

            if (!resposta.ok) {
                throw new Error(`Erro ao buscar dados: ${resposta.statusText}`);
            }

            const dados = await resposta.json();
            // Assumindo que a resposta é um array de usuários
            setUsuarios(dados); 
        } catch (e) {
            setErro("Não foi possível carregar os usuários. Verifique sua conexão ou a API.");
            console.error("Erro na busca de usuários:", e);
        } finally {
            setCarregando(false);
        }
    };

    // Efeito para carregar os usuários ao montar o componente
    useEffect(() => {
        buscarUsuarios();
    }, []); 


    // FUNÇÃO DE INATIVAÇÃO
    const handleInativar = async (id) => {
        const usuarioAlvo = usuarios.find(u => u.idUsuario === id);
        
        // Exemplo: Altera o estado 'ativo' para o oposto
        const novoStatus = usuarioAlvo && usuarioAlvo.ativo !== undefined ? !usuarioAlvo.ativo : false; 
        const acao = novoStatus ? 'ativar' : 'inativar';

        if (!window.confirm(`Tem certeza que deseja ${acao} o usuário: ${usuarioAlvo.nome}?`)) {
            return;
        }

        try {
            setCarregando(true);
            setErro(null);
            setMensagemSucesso(null);

            const resposta = await fetch(`${API_URL}/${id}`, {
                method: 'PATCH', // Ou 'PUT', dependendo da sua API
                headers: {
                    'Content-Type': 'application/json',
                    // Adicione aqui outros headers, como Authorization, se necessário
                },
                body: JSON.stringify({ ativo: novoStatus }) // Envia o novo status
            });

            if (!resposta.ok) {
                throw new Error(`Erro ao ${acao} usuário: ${resposta.statusText}`);
            }
            
            // Se a operação for bem-sucedida, recarrega a lista para refletir a mudança
            await buscarUsuarios(); 
            setMensagemSucesso(`Usuário ID: ${usuarioAlvo.nome} ${acao}do com sucesso!`);
            
        } catch (e) {
            setErro(`Falha ao ${acao} usuário: ${e.message}`);
            console.error(`Erro na operação de ${acao}:`, e);
        } finally {
            setCarregando(false);
        }
    };

    // FUNÇÃO DE DELEÇÃO
    const handleDeletar = async (id) => {
        const usuarioAlvo = usuarios.find(u => u.idUsuario === id);

        if (!window.confirm(`Tem certeza que deseja DELETAR PERMANENTEMENTE o usuário: ${usuarioAlvo.nome}?`)) {
            return;
        }

        try {
            setCarregando(true);
            setErro(null);
            setMensagemSucesso(null);

            const resposta = await fetch(`${API_URL}/${id}`, {
                method: 'DELETE',
            });

            if (!resposta.ok) {
                // Tenta ler o erro do corpo da resposta, se disponível
                const erroData = await resposta.json().catch(() => ({ message: resposta.statusText }));
                throw new Error(`Erro ao deletar usuário: ${erroData.message}`);
            }

            // Se a operação for bem-sucedida, recarrega a lista para remover o usuário
            await buscarUsuarios();
            setMensagemSucesso(`Usuário ID: ${id} deletado com sucesso!`);
            
        } catch (e) {
            setErro(`Falha ao deletar usuário: ${e.message}`);
            console.error("Erro na operação de deleção:", e);
        } finally {
            setCarregando(false);
        }
    };

    // ----------------------------------------------------
    // LÓGICA DE EXIBIÇÃO DE ESTADO
    // ----------------------------------------------------

    if (carregando) {
        return <div className="container"><p>Carregando usuários...</p></div>;
    }

    // ----------------------------------------------------
    // RENDERIZAÇÃO DO CONTEÚDO FINAL
    // ----------------------------------------------------
    return (
        <div className="visualizar-usuarios-page">
         
            {/* Mensagens de Feedback */}
            {erro && <div className="alerta-erro" style={{ color: 'red', marginBottom: '15px' }}>{erro}</div>}
            {mensagemSucesso && <div className="alerta-sucesso" style={{ color: 'green', marginBottom: '15px' }}>{mensagemSucesso}</div>}

            {usuarios.length === 0 ? (
                <p>Nenhum usuário cadastrado.</p>
            ) : (
                <table className="tabela-usuarios">
                    <thead>
                        <tr>
                            
                            <th>Nome</th>
                            <th>Email</th>
                            <th>Status</th> {/* Coluna para o status (ativo/inativo) */}
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {usuarios.map(usuario => {
                            // Assumindo que a propriedade de status é 'ativo' (booleana)
                            const isAtivo = usuario.ativo !== undefined ? usuario.ativo : true; // Fallback para true
                            const statusTexto = isAtivo ? 'Ativo' : 'Inativo';

                            return (
                                <tr key={usuario.idUsuario} className={!isAtivo ? 'inativo' : ''}>
                                    <td>{usuario.nome}</td>
                                    <td>{usuario.email}</td>
                                    
                                    <td style={{ color: isAtivo ? 'green' : 'orange' }}>{statusTexto}</td>
                                    <td className="acoes-coluna-icones">

                                        <div 
                                            className={`toggle-switch ${isAtivo ? 'ativo' : 'inativo'}`}
                                            onClick={() => handleInativar(usuario.idUsuario)}
                                            title={isAtivo ? 'Inativar Usuário' : 'Ativar Usuário'}
                                        >
                                            <div className="switch-ball"></div>
                                        </div>
                                        
                                        <button 
                                            className="btn-deletar"
                                            onClick={() => handleDeletar(usuario.idUsuario)}
                                            title="Deletar Usuário"
                                        >
                                            Deletar
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            )}
        </div>
    );
}



export default function VisualizarUsuarios() {
    return (
        <Layout title="Visualizar Usuários"> 
            <VisualizarUsuariosContent />
        </Layout>
    );
}