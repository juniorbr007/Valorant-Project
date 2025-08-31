import React from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const ClusterPieChart = ({ matches }) => {
  // 1. Conta quantas partidas pertencem a cada cluster
  const clusterCounts = matches.reduce((acc, match) => {
    const cluster = match.predictedCluster || 'Não Classificado';
    acc[cluster] = (acc[cluster] || 0) + 1;
    return acc;
  }, {});

  const data = {
    labels: Object.keys(clusterCounts), // Ex: ['Agressivo', 'Tático', 'Suporte']
    datasets: [{
      label: '# de Partidas',
      data: Object.values(clusterCounts), // Ex: [25, 15, 10]
      backgroundColor: [
        'rgba(253, 69, 86, 0.7)',  // Agressivo (Vermelho)
        'rgba(54, 162, 235, 0.7)', // Tático (Azul)
        'rgba(75, 192, 192, 0.7)', // Suporte (Verde-água)
      ],
      borderColor: [ '#1a1a1a' ],
      borderWidth: 2,
    }],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top', labels: { color: '#fafafa', font: { size: 14 } } },
      title: {
        display: true,
        text: 'Distribuição de Estilos de Jogo (Resultado do Clustering)',
        color: '#fafafa',
        font: { size: 18, family: "'Teko', sans-serif" }
      },
    },
  };

  return <Pie data={data} options={options} />;
};

export default ClusterPieChart;