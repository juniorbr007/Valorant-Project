import React from 'react';
import { useState } from 'react';

// --- IMPORTAÇÕES ---
// Importamos todos os componentes de página que o App vai controlar.
import Navbar from './components/layouts/Navbar/Navbar';
import Footer from './components/layouts/Footer/Footer';
import GameSelectionScreen from './features/GameSelection/GameSelectionScreen'; 
import ValorantDashboard from './features/valorant/ValorantDashboard';
import AgentsPage from './features/valorant/pages/AgentsPage/AgentsPage';
import AgentDetailPage from './features/valorant/pages/AgentDetailPage/AgentDetailPage';

import './App.css';

// --- PLACEHOLDER ---
const LolDashboard = () => <div className="placeholder-container"><h2>Dashboard do League of Legends</h2><p>Em breve...</p></div>;


// --- COMPONENTE PRINCIPAL APP ---
function App() {
  // 'currentView' controla qual tela principal está visível.
  const [currentView, setCurrentView] = useState('selection');
  
  // 'selectedAgentId' guarda o ID do agente clicado.
  const [selectedAgentId, setSelectedAgentId] = useState(null);

  // --- FUNÇÕES DE CONTROLE ---

  // Passada para a Navbar para mudar a view (ex: ir para 'agents').
  const handleNavigate = (view) => {
    setCurrentView(view);
  };

  // Passada para a GameSelectionScreen.
  const handleSelectGame = (game) => {
    if (game === 'valorant') {
      setCurrentView('valorantDashboard');
    } else if (game === 'lol') {
      setCurrentView('lolDashboard');
    }
  };
  
  // Passada para a AgentsPage. É chamada quando um agente é clicado.
  const handleSelectAgent = (agentId) => {
    setSelectedAgentId(agentId); // 1. Guarda o ID
    setCurrentView('agentDetail'); // 2. Muda a tela para a de detalhes
  };

  // --- LÓGICA DE RENDERIZAÇÃO ---
  const renderContent = () => {
    switch (currentView) {
      case 'selection':
        return <GameSelectionScreen onSelectGame={handleSelectGame} />;
      case 'valorantDashboard':
        return <ValorantDashboard />;
      case 'lolDashboard':
        return <LolDashboard />;
      case 'agents':
        // Passa a função 'handleSelectAgent' para a AgentsPage
        return <AgentsPage onSelectAgent={handleSelectAgent} />;
      case 'agentDetail':
        // Passa o ID guardado para a AgentDetailPage
         return <AgentDetailPage agentId={selectedAgentId} onBack={() => handleNavigate('agents')} />;
      default:
        return <GameSelectionScreen onSelectGame={handleSelectGame} />;
    }
  };

  return (
    <div className="app-container">
      <Navbar currentView={currentView} onNavigate={handleNavigate} />
      <main className="content-wrapper">
        {renderContent()}
      </main>
       <Footer />
    </div>
  );
}

export default App;

