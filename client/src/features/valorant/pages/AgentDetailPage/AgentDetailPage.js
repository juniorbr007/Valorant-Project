import React, { useState, useEffect } from 'react';
import './AgentDetailPage.css';

// O componente agora também recebe a função 'onBack' do App.js
const AgentDetailPage = ({ agentId, onBack }) => {
  const [agent, setAgent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // NOVO: Estado para controlar qual habilidade está no modal
  const [selectedAbility, setSelectedAbility] = useState(null);

  useEffect(() => {
    if (!agentId) return;
    const fetchAgentDetails = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`https://valorant-api.com/v1/agents/${agentId}?language=pt-BR`);
        if (!response.ok) throw new Error('Não foi possível buscar os detalhes do agente.');
        const { data } = await response.json();
        setAgent(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAgentDetails();
  }, [agentId]);

  if (isLoading) return <div className="loading-message">Carregando detalhes do agente...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!agent) return <div className="loading-message">Agente não encontrado.</div>;

  // Função para fechar o modal (pode ser chamada pelo overlay ou pelo botão)
  const handleCloseModal = () => setSelectedAbility(null);

  return (
    <>
      <div className="agent-detail-container">
        {/* AJUSTE: A classe mudou de 'agent-portrait-container' para 'agent-portrait' */}
        <div className="agent-portrait">
          <img src={agent.fullPortrait} alt={agent.displayName} />
        </div>
        
        <div className="agent-info">
          {/* AJUSTE: Classes atualizadas para bater com o CSS */}
          <div className="agent-header">
            <h1>{agent.displayName}</h1>
            <h3>{agent.role.displayName}</h3>
          </div>
          
          <p className="agent-description">{agent.description}</p>
          
          <h2>Habilidades</h2>
          {/* AJUSTE: Classe atualizada para 'agent-abilities' */}
          <div className="agent-abilities">
            {agent.abilities.map((ability) => (
              // NOVO: Adicionado onClick para abrir o modal com a habilidade clicada
              <div key={ability.slot} className="ability-card" onClick={() => setSelectedAbility(ability)}>
                <img src={ability.displayIcon} alt={ability.displayName} />
                <p>{ability.displayName}</p>
              </div>
            ))}
          </div>

          {/* NOVO: Botão de voltar que chama a função 'onBack' recebida do App.js */}
          <button onClick={onBack} className="back-link">Voltar para a Lista</button>
        </div>
      </div>

      {/* NOVO: Renderização condicional do Modal de Habilidades */}
      {selectedAbility && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}> {/* Impede que o clique dentro do modal feche-o */}
            <div className="modal-header">
              <img src={selectedAbility.displayIcon} alt={selectedAbility.displayName} />
              <h2>{selectedAbility.displayName}</h2>
            </div>
            <p className="modal-description">{selectedAbility.description}</p>
            <button className="modal-close-button" onClick={handleCloseModal}>Fechar</button>
          </div>
        </div>
      )}
    </>
  );
};

export default AgentDetailPage;