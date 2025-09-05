import React, { useState, useEffect } from 'react';
// O caminho para o CSS agora precisa de um '../' extra pois saímos de /pages/
import './PerformancePage.css'; 

// Importando os componentes de gráfico
import PerformanceChart from '../../../../charts/PerformanceChart/PerformanceChart';
import AgentPerformanceChart from '../../components/AgentPerformanceChart/AgentPerformanceChart';
import ScatterPlotChart from '../../../../charts/ScatterPlotChart/ScatterPlotChart';
import DistributionChart from '../../components/DistributionChart/DistributionChart';
import RolePerformanceChart from '../../../../charts/RolePerformanceChart/RolePerformanceChart';
import ClusterPieChart from '../../../../charts/ClusterPieChart/ClusterPieChart';


const PerformancePage = () => {
  // Estados (sem alteração)
  const [matches, setMatches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Busca de dados (sem alteração)
  useEffect(() => {
    const fetchMatchData = async () => {
      try {
        const apiUrl = `${process.env.REACT_APP_API_URL}/api/matches`;
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error('Falha ao buscar os dados.');
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

  if (isLoading) return <div className="loading-message">Carregando análises...</div>;
  if (error) return <div className="error-message">{error}</div>;

  // 2. LÓGICA DE DADOS PARA O GRÁFICO É ADICIONADA DE VOLTA
  const matchesForTimelineChart = matches.slice(0, 15).reverse();

  return (
    <div className="performance-page-container">
      {/* 3. O GRÁFICO É RENDERIZADO NOVAMENTE NO TOPO */}
      <div className="chart-container-full">
        <PerformanceChart matches={matchesForTimelineChart} />
      </div>

      <div className="charts-grid-container">
        <div className="chart-container-half">
          <AgentPerformanceChart matches={matches} />
        </div>
        <div className="chart-container-half">
          <ScatterPlotChart matches={matches} />
        </div>
        <div className="chart-container-half">
          <DistributionChart matches={matches} />
        </div>
        <div className="chart-container-half">
          <ClusterPieChart matches={matches} />
        </div>
      </div>

      <div className="chart-container-large">
        <RolePerformanceChart matches={matches} />
      </div>
    </div>
  );
};

export default PerformancePage;