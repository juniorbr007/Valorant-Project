import React, { useState, useEffect } from 'react';

// Importando TODOS os nossos componentes de gráfico
import PerformanceChart from '../PerformanceChart/PerformanceChart';
import AgentPerformanceChart from '../AgentPerformanceChart/AgentPerformanceChart';
import ScatterPlotChart from '../ScatterPlotChart/ScatterPlotChart';
import DistributionChart from '../DistributionChart/DistributionChart';
import RolePerformanceChart from '../RolePerformanceChart/RolePerformanceChart';
import ClusterPieChart from '../ClusterPieChart/ClusterPieChart'; // 1. O GRÁFICO QUE FALTAVA

// --- ESTILOS DOS CONTAINERS ---
const chartContainerStyle = {
  backgroundColor: '#2c2c2c',
  borderRadius: '10px',
  padding: '20px',
  border: '1px solid #444',
  height: '450px',
  position: 'relative',
  marginBottom: '30px',
};
const largeChartContainerStyle = {
  ...chartContainerStyle,
  height: '550px',
};

const PerformancePage = () => {
  // Estados para gerenciar os dados, carregamento e erros
  const [matches, setMatches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMatchData = async () => {
      try {
        const apiUrl = `${process.env.REACT_APP_API_URL}/api/matches`;
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error('Falha ao buscar os dados das partidas do banco.');
        const data = await response.json();
        setMatches(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMatchData();
  }, []);

  if (isLoading) return <div className="loading-message">Carregando análises do banco de dados...</div>;
  if (error) return <div className="error-message">{error}</div>;

  const matchesForTimelineChart = matches.slice(0, 15).reverse();

  return (
    <div>
      {/* Gráfico principal de evolução do ACS */}
      <div style={chartContainerStyle}>
        <PerformanceChart matches={matchesForTimelineChart} />
      </div>

      {/* 2. GRADE 2x2 COM OS GRÁFICOS DE ANÁLISE PROFUNDA */}
      <div className="charts-grid-container">
        <div style={chartContainerStyle}>
          <AgentPerformanceChart matches={matches} />
        </div>
        <div style={chartContainerStyle}>
          <ScatterPlotChart matches={matches} />
        </div>
        <div style={chartContainerStyle}>
          <DistributionChart matches={matches} />
        </div>
        {/* O GRÁFICO DE PIZZA, FINALMENTE DE VOLTA! */}
        <div style={chartContainerStyle}>
          <ClusterPieChart matches={matches} />
        </div>
      </div>

      {/* Gráfico de radar, ocupando a largura total no final */}
      <div style={largeChartContainerStyle}>
        <RolePerformanceChart matches={matches} />
      </div>
    </div>
  );
};

// Componente auxiliar para os estilos do grid
const ChartsGrid = () => (
  <style>{`
    .charts-grid-container {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 30px;
      margin-top: 30px;
      margin-bottom: 30px;
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