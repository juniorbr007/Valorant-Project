import React, { useState } from 'react';
import './App.css';

// --- IMPORTAÇÕES DE MÓDULOS E COMPONENTES ---
// Agrupamos todas as importações para melhor organização.

// Layouts Globais
import Navbar from './components/layouts/Navbar/Navbar';
import Footer from './components/layouts/Footer/Footer';

// Features Principais
import GameSelectionScreen from './features/GameSelection/GameSelectionScreen'; 
import ValorantDashboard from './features/valorant/ValorantDashboard';
import LolDashboard from './features/lol/LolDashboard'; // Importa o dashboard real do LoL

// Páginas Específicas (sub-rotas)
import AgentsPage from './features/valorant/pages/AgentsPage/AgentsPage';
import AgentDetailPage from './features/valorant/pages/AgentDetailPage/AgentDetailPage';


/**
 * Componente principal que orquestra toda a navegação e renderização de alto nível da aplicação.
 * @returns {JSX.Element} O componente App renderizado.
 */
function App() {
  // Estado que controla qual tela principal está visível. Inicia na tela de seleção.
  const [currentView, setCurrentView] = useState('selection');
  
  // Estado que armazena o ID do agente selecionado para ser passado para a página de detalhes.
  const [selectedAgentId, setSelectedAgentId] = useState(null);

  // --- FUNÇÕES DE CONTROLE DE NAVEGAÇÃO ---

  /**
   * Navega para uma view principal. Usado pela Navbar.
   * @param {string} view - O identificador da view para a qual navegar (ex: 'agents', 'selection').
   */
  const handleNavigate = (view) => {
    setCurrentView(view);
  };

  /**
   * Navega para o dashboard de um jogo específico. Usado pela GameSelectionScreen.
   * @param {'valorant' | 'lol'} game - O jogo selecionado.
   */
  const handleSelectGame = (game) => {
    if (game === 'valorant') {
      setCurrentView('valorantDashboard');
    } else if (game === 'lol') {
      setCurrentView('lolDashboard');
    }
  };
  
  /**
   * Seleciona um agente e navega para a página de detalhes. Usado pela AgentsPage.
   * @param {string} agentId - O UUID do agente selecionado.
   */
  const handleSelectAgent = (agentId) => {
    setSelectedAgentId(agentId); // 1. Armazena o ID
    setCurrentView('agentDetail'); // 2. Muda a view para a de detalhes
  };

  /**
   * Decide qual componente renderizar com base no estado 'currentView'.
   * @returns {JSX.Element} O componente de página a ser renderizado.
   */
  const renderContent = () => {
    switch (currentView) {
      case 'selection':
        return <GameSelectionScreen onSelectGame={handleSelectGame} />;
      case 'valorantDashboard':
        return <ValorantDashboard />;
      case 'lolDashboard':
        // Agora usa o componente real importado.
        return <LolDashboard />; 
      case 'agents':
        return <AgentsPage onSelectAgent={handleSelectAgent} />;
      case 'agentDetail':
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