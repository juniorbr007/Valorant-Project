import React, { useState } from 'react';
import './ValorantDashboard.css'; // Estilos para o container e as abas

// Importando as PÁGINAS que serão exibidas em cada aba
// Certifique-se que estes caminhos estão corretos após a refatoração!
import DashboardOverview from './pages/DashboardOverview/DashboardOverview';
import PerformancePage from './pages/PerformancePage/PerformancePage';
import ModelLabPage from './pages/ModelLabPage/ModelLabPage';
import RoadmapPage from './pages/RoadmapPage/RoadmapPage';

const ValorantDashboard = () => {
  // Este estado controla qual aba está ativa
  const [activeTab, setActiveTab] = useState('overview');

  // Esta função decide qual componente de página renderizar
  const renderActiveTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <DashboardOverview />;
      case 'performance':
        return <PerformancePage />;
      case 'models':
        return <ModelLabPage />;
      case 'roadmap':
        return <RoadmapPage />;
      default:
        return <DashboardOverview />; // Aba padrão
    }
  };

  return (
    <div className="valorant-dashboard-container">
      {/* Barra de Navegação das Abas */}
      <nav className="dashboard-nav">
        <button 
          onClick={() => setActiveTab('overview')} 
          className={activeTab === 'overview' ? 'active' : ''}
        >
          Visão Geral
        </button>
        <button 
          onClick={() => setActiveTab('performance')} 
          className={activeTab === 'performance' ? 'active' : ''}
        >
          Análise de Performance
        </button>
        <button 
          onClick={() => setActiveTab('models')} 
          className={activeTab === 'models' ? 'active' : ''}
        >
          Laboratório de Modelos
        </button>
        <button 
          onClick={() => setActiveTab('roadmap')} 
          className={activeTab === 'roadmap' ? 'active' : ''}
        >
          Roteiro do Projeto
        </button>
      </nav>

      {/* Conteúdo da Aba Ativa */}
      <div className="dashboard-content">
        {renderActiveTabContent()}
      </div>
    </div>
  );
};

export default ValorantDashboard;

