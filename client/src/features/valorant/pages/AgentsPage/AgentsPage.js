import React, { useState, useEffect } from 'react';
import './AgentsPage.css';

const AgentsPage = ({ onSelectAgent }) => {
  const [agents, setAgents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const apiUrl = `${process.env.REACT_APP_API_URL}/api/content`;
        const response = await fetch(apiUrl);

        if (!response.ok) {
          throw new Error('Falha ao buscar os dados do servidor.');
        }

        const data = await response.json();

        // --- PONTO DE INVESTIGAÇÃO 1: DADOS BRUTOS ---
        // Vamos ver o que o backend realmente nos enviou.
        console.log('Dados recebidos do backend:', data);

        const playableAgents = data.filter(agent => agent.name && agent.displayIcon);
        setAgents(playableAgents);

      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAgents();
  }, []);

  // --- PONTO DE INVESTIGAÇÃO 2: ESTADO DO COMPONENTE ---
  // Vamos verificar o que está guardado no nosso estado 'agents' antes de renderizar.
  console.log('Estado "agents" antes de renderizar:', agents);


  if (isLoading) {
    return <div className="loading-message">Carregando Agentes...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="agents-container">
      <h1>Agentes do Valorant</h1>
      <div className="agents-grid">
        {/* Se o array 'agents' estiver vazio, o .map não renderiza nada! */}
        {agents.map(agent => (
          <div 
            key={agent.id} 
            className="agent-card-link"
            onClick={() => onSelectAgent(agent.id)}
            role="button"
            tabIndex={0}
            onKeyPress={(e) => e.key === 'Enter' && onSelectAgent(agent.id)}
          >
            <div className="agent-card">
              <img src={agent.displayIcon} alt={agent.name} className="agent-icon" /> 
              <h3 className="agent-name">{agent.name}</h3>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AgentsPage;