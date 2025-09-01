import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const AgentPerformanceChart = ({ matches }) => {
  // --- LÓGICA DE PROCESSAMENTO DE DADOS ---
  const agentData = matches.reduce((acc, match) => {
    const agentName = match.playerStats.agent;
    const acs = match.playerStats.score;

    if (!acc[agentName]) {
      acc[agentName] = { totalAcs: 0, matchCount: 0 };
    }

    acc[agentName].totalAcs += acs;
    acc[agentName].matchCount += 1;

    return acc;
  }, {});

  const agentLabels = Object.keys(agentData);
  const averageAcsData = agentLabels.map(agent => {
    return (agentData[agent].totalAcs / agentData[agent].matchCount).toFixed(0);
  });
  // --- FIM DO PROCESSAMENTO ---

  const data = {
    labels: agentLabels,
    datasets: [{
      label: 'ACS Médio',
      data: averageAcsData,
      backgroundColor: agentLabels.map(() => `rgba(253, 69, 86, ${0.6 + Math.random() * 0.4})`), // Cores variadas
      borderColor: '#fd4556',
      borderWidth: 1,
    }],
  };

  const options = {
    indexAxis: 'y', // <-- Isso torna o gráfico de barras horizontal
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: 'Desempenho Médio por Agente (ACS)',
        color: '#fafafa',
        font: { size: 18, family: "'Teko', sans-serif" }
      },
    },
    scales: {
      x: { ticks: { color: '#aaa' }, grid: { color: 'rgba(255, 255, 255, 0.1)' } },
      y: { ticks: { color: '#aaa' }, grid: { display: false } }
    }
  };

  return <Bar options={options} data={data} />;
};

export default AgentPerformanceChart;