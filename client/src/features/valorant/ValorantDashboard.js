import React, { useState } from 'react';
import './ValorantDashboard.css';

// Importando as PÁGINAS que serão exibidas em cada aba.
// Verifique se esses componentes existem nos caminhos corretos!
import DashboardOverview from './pages/DashboardOverview/DashboardOverview';
import PerformancePage from './pages/PerformancePage/PerformancePage';
import ModelLabPage from './pages/ModelLabPage/ModelLabPage';
import RoadmapPage from './pages/RoadmapPage/RoadmapPage';

const ValorantDashboard = () => {
  // O estado 'activeTab' controla qual página/componente é exibido.
  // 'overview' é o valor inicial, então a "Visão Geral" carrega primeiro.
  const [activeTab, setActiveTab] = useState('overview');

  // Função para renderizar o conteúdo da aba ativa.
  // Usamos um switch para decidir qual componente mostrar.
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
        // Por segurança, retorna a visão geral se nenhum caso corresponder.
        return <DashboardOverview />;
    }
  };

  return (
    <div className="valorant-dashboard-container">
      {/* Navegação por Abas */}
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

      {/* Área de Conteúdo Dinâmico */}
      <div className="dashboard-content">
        {renderActiveTabContent()}
      </div>
    </div>
  );
};

export default ValorantDashboard;

