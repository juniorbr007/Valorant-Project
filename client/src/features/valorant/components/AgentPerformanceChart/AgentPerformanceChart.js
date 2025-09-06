import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

// Registra os componentes necessários do Chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const AgentPerformanceChart = ({ matches }) => {
  // 1. Processamento dos Dados
  // Calcula o ACS médio para cada agente jogado
  const processData = () => {
    const agentStats = {};

    if (!matches || matches.length === 0) {
      return { agentLabels: [], avgAcsData: [] };
    }

    matches.forEach(match => {
      const agentName = match.playerStats.agent;
      const acs = match.playerStats.acs;

      if (!agentStats[agentName]) {
        agentStats[agentName] = { totalAcs: 0, matchCount: 0 };
      }

      agentStats[agentName].totalAcs += acs;
      agentStats[agentName].matchCount++;
    });

    // Calcula a média e prepara para o gráfico
    const processedAgents = Object.keys(agentStats).map(agent => ({
      name: agent,
      avgAcs: agentStats[agent].totalAcs / agentStats[agent].matchCount,
    }));

    // Ordena os agentes pela performance (do maior para o menor)
    processedAgents.sort((a, b) => b.avgAcs - a.avgAcs);

    return {
      agentLabels: processedAgents.map(a => a.name),
      avgAcsData: processedAgents.map(a => a.avgAcs.toFixed(1)), // Arredonda para 1 casa decimal
    };
  };

  const { agentLabels, avgAcsData } = processData();

  // 2. Configuração do Gráfico para o Chart.js
  const chartData = {
    labels: agentLabels,
    datasets: [
      {
        label: 'ACS Médio',
        data: avgAcsData,
        backgroundColor: 'rgba(139, 92, 246, 0.6)', // Cor roxa para diferenciar
        borderColor: 'rgba(139, 92, 246, 1)',
        borderWidth: 1,
        borderRadius: 5,
      },
    ],
  };

  const chartOptions = {
    indexAxis: 'y', // Transforma em um gráfico de barras horizontal, melhor para listas
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: '#0f172a',
        titleColor: '#f0f0f0',
        bodyColor: '#cbd5e1',
        borderColor: '#334155',
        borderWidth: 1,
      },
    },
    scales: {
      y: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#cbd5e1',
        },
      },
      x: {
        grid: {
          color: 'rgba(71, 85, 105, 0.5)',
        },
        ticks: {
          color: '#cbd5e1',
        },
      },
    },
  };

  // 3. Renderização do Componente
  return (
    <div style={{ position: 'relative', height: '100%', width: '100%' }}>
      <Bar options={chartOptions} data={chartData} />
    </div>
  );
};

export default AgentPerformanceChart;

