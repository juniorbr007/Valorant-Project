import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; // Importa o componente Link para navegação
import './AgentsPage.css';

const AgentsPage = () => {
  // Estados para gerenciar os dados, o carregamento e os erros
  const [agents, setAgents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // useEffect é executado uma vez, quando o componente é montado na tela
  useEffect(() => {
    // Função assíncrona para buscar os dados dos agentes no nosso backend
    const fetchAgents = async () => {
      try {
        // Usa a variável de ambiente para saber a URL do backend
        const apiUrl = `${process.env.REACT_APP_API_URL}/api/content`;
        const response = await fetch(apiUrl);

        // Verifica se a resposta da rede foi bem-sucedida
        if (!response.ok) {
          throw new Error('Falha ao buscar os dados do servidor.');
        }

        const data = await response.json();
        setAgents(data); // Armazena a lista de agentes no estado
      } catch (err) {
        setError(err.message); // Armazena qualquer erro que tenha ocorrido
      } finally {
        setIsLoading(false); // Garante que o estado de carregamento termine, com ou sem erro
      }
    };

    fetchAgents();
  }, []); // O array vazio [] como segundo argumento garante que o useEffect rode apenas uma vez

  // Renderização condicional: mostra uma mensagem enquanto os dados estão sendo carregados
  if (isLoading) {
    return <div className="loading-message">Carregando Agentes...</div>;
  }

  // Renderização condicional: mostra uma mensagem se ocorreu um erro na busca
  if (error) {
    return <div className="error-message">{error}</div>;
  }

  // Renderização principal: mostra a lista de agentes quando os dados estiverem prontos
  return (
    <div className="agents-container">
      <h1>Agentes do Valorant</h1>
      <div className="agents-grid">
        {agents.map(agent => (
          // Cada card de agente agora é um Link que leva para a sua página de detalhes
          // A URL é construída dinamicamente com o ID (UUID) do agente
          <Link to={`/agents/${agent.id}`} key={agent.id} className="agent-card-link">
            <div className="agent-card">
              <img src={agent.displayIcon} alt={agent.name} className="agent-icon" /> 
              <h3 className="agent-name">{agent.name}</h3>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default AgentsPage;