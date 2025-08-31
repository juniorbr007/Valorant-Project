import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import './AgentDetailPage.css';

const AgentDetailPage = () => {
  const { agentId } = useParams();
  const [agent, setAgent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // 1. NOVO ESTADO: para controlar qual habilidade está no modal
  // Começa como 'null', significando que o modal está fechado.
  const [selectedAbility, setSelectedAbility] = useState(null);

  useEffect(() => {
    // ... a lógica de fetch continua a mesma ...
    const fetchAgentDetails = async () => {
        try {
            const response = await fetch(`https://valorant-api.com/v1/agents/${agentId}?language=pt-BR`);
            if (!response.ok) throw new Error('Agente não encontrado.');
            const data = await response.json();
            setAgent(data.data);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };
    fetchAgentDetails();
  }, [agentId]);

  if (isLoading) return <div className="loading-message">Carregando dados do agente...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!agent) return <div>Agente não encontrado.</div>;

  return (
    <> {/* Usamos um Fragment <> para poder ter o modal como "irmão" do container principal */}
      <div className="agent-detail-container">
        <div className="agent-portrait">
          <img src={agent.fullPortraitV2} alt={agent.displayName} />
        </div>
        <div className="agent-info">
          <div className="agent-header">
            <h1>{agent.displayName.toUpperCase()}</h1>
            <h3>// {agent.role.displayName}</h3>
          </div>
          <p className="agent-description">{agent.description}</p>
          <h2>// HABILIDADES</h2>
          <div className="agent-abilities">
            {agent.abilities.map(ability => (
              // 2. Adiciona um onClick para abrir o modal com a habilidade clicada
              <div key={ability.slot} className="ability-card" onClick={() => setSelectedAbility(ability)}>
                <img src={ability.displayIcon} alt={ability.displayName} />
                <p>{ability.displayName}</p>
              </div>
            ))}
          </div>
          <br />
          <Link to="/agents" className="back-link">Voltar para a lista de Agentes</Link>
        </div>
      </div>

      {/* 3. O MODAL: só é renderizado se 'selectedAbility' não for nulo */}
      {selectedAbility && (
        <div className="modal-overlay" onClick={() => setSelectedAbility(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <img src={selectedAbility.displayIcon} alt={selectedAbility.displayName} />
              <h2>{selectedAbility.displayName}</h2>
            </div>
            <p className="modal-description">{selectedAbility.description}</p>
            <button className="modal-close-button" onClick={() => setSelectedAbility(null)}>Fechar</button>
          </div>
        </div>
      )}
    </>
  );
};

export default AgentDetailPage;