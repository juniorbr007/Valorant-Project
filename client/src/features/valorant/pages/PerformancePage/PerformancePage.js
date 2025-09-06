import React, { useState, useEffect } from 'react';
import './PerformancePage.css'; 

// --- IMPORTAÇÕES FINAIS E CORRIGIDAS ---
// Este caminho agora está correto para a nossa estrutura final.
import AgentPerformanceChart from '../../components/AgentPerformanceChart/AgentPerformanceChart';
import DistributionChart from '../../components/DistributionChart/DistributionChart';
import PerformanceChart from '../../components/PerformanceChart/PerformanceChart';
import ScatterPlotChart from '../../components/ScatterPlotChart/ScatterPlotChart';
import RolePerformanceChart from '../../components/RolePerformanceChart/RolePerformanceChart';
import ClusterPieChart from '../../components/ClusterPieChart/ClusterPieChart';


const PerformancePage = () => {
  // A sua lógica de buscar dados (useState, useEffect) está perfeita e continua aqui.
  const [matches, setMatches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMatchData = async () => {
      try {
        const apiUrl = `${process.env.REACT_APP_API_URL}/api/matches`;
        const response = await fetch(apiUrl);
        if (!response.ok) {
          throw new Error('Falha ao buscar os dados das partidas.');
        }
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

  const matchesForTimelineChart = matches.slice(0, 15).reverse();

  return (
    <div className="performance-page-container">
      <div className="chart-container-full">
        <h3>Evolução de Performance (Últimas 15 Partidas)</h3>
        <PerformanceChart matches={matchesForTimelineChart} />
      </div>
      <div className="charts-grid-container">
        <div className="chart-container-half">
          <h3>Performance Média por Agente</h3>
          <AgentPerformanceChart matches={matches} />
        </div>
        <div className="chart-container-half">
          <h3>ACS vs. K/D Ratio</h3>
          <ScatterPlotChart matches={matches} />
        </div>
        <div className="chart-container-half">
          <h3>Distribuição de Pontuação (ACS)</h3>
          <DistributionChart matches={matches} />
        </div>
        <div className="chart-container-half">
          <h3>Estilos de Jogo (Clusters)</h3>
          <ClusterPieChart matches={matches} />
        </div>
      </div>
      <div className="chart-container-large">
        <h3>Performance Média por Função</h3>
        <RolePerformanceChart matches={matches} />
      </div>
    </div>
  );
};

export default PerformancePage;

