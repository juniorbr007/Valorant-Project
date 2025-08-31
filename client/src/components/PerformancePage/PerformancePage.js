import React from 'react';
import { mockMatches } from '../../data/mockMatchData';

// Importando todos os nossos componentes de gráfico
import PerformanceChart from '../PerformanceChart/PerformanceChart';
import AgentPerformanceChart from '../AgentPerformanceChart/AgentPerformanceChart';
import ScatterPlotChart from '../ScatterPlotChart/ScatterPlotChart';
import DistributionChart from '../DistributionChart/DistributionChart';
import RolePerformanceChart from '../RolePerformanceChart/RolePerformanceChart';
import ClusterPieChart from '../ClusterPieChart/ClusterPieChart';

// --- ESTILOS DOS CONTAINERS ---

// Estilo padrão para a maioria dos gráficos
const chartContainerStyle = {
  backgroundColor: '#2c2c2c',
  borderRadius: '10px',
  padding: '20px',
  border: '1px solid #444',
  height: '450px',
  position: 'relative',
  marginBottom: '30px',
};

// 1. NOVO ESTILO: Um container com altura maior, específico para o Gráfico de Radar
const largeChartContainerStyle = {
  ...chartContainerStyle, // Herda todas as propriedades do estilo padrão
  height: '550px',       // Mas sobrescreve a altura para ser maior
};


const PerformancePage = () => {
  // Pega as 15 partidas mais recentes para o gráfico de linha do tempo
  const matchesForTimelineChart = mockMatches.slice(0, 15).reverse();

  return (
    <div>
      {/* Gráfico de linha do tempo, usando o estilo padrão */}
      <div style={chartContainerStyle}>
        <PerformanceChart matches={matchesForTimelineChart} />
      </div>

      <div className="charts-grid-container">
        {/* Gráfico de desempenho por agente */}
        <div style={chartContainerStyle}>
          <AgentPerformanceChart matches={mockMatches} />
        </div>

        {/* Gráfico de dispersão */}
        <div style={chartContainerStyle}>
          <ScatterPlotChart matches={mockMatches} />
        </div>
      </div>

      {/* Gráfico de distribuição, usando o estilo padrão */}
      <div style={chartContainerStyle}>
        <DistributionChart matches={mockMatches} />
      </div>

      {/* 2. O Gráfico de Radar, agora usando o NOVO estilo com altura maior */}
      <div style={largeChartContainerStyle}>
        <RolePerformanceChart matches={mockMatches} />
      </div>

      {/* 2. NOVO GRÁFICO DE CLUSTERING */}
      <div style={largeChartContainerStyle}>
        <ClusterPieChart matches={mockMatches} />
      </div>
    </div>
  );
};


// Estilos para o grid (continua o mesmo)
const ChartsGrid = () => (
  <style>{`
    .charts-grid-container {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 30px;
      margin-top: 30px;
      margin-bottom: 30px; /* Adiciona um espaço abaixo do grid */
    }
    @media (max-width: 1200px) {
      .charts-grid-container {
        grid-template-columns: 1fr;
      }
    }
  `}</style>
);

const StyledPerformancePage = () => (
  <>
    <ChartsGrid />
    <PerformancePage />
  </>
);

export default StyledPerformancePage;