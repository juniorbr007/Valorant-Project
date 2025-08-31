import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// É necessário registrar os componentes do Chart.js que vamos usar
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const PerformanceChart = ({ matches }) => {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top', labels: { color: '#fafafa' } },
      title: {
        display: true,
        text: 'Pontuação de Combate (ACS) por Partida',
        color: '#fafafa',
        font: { size: 18, family: "'Teko', sans-serif" }
      },
    },
    scales: {
      x: { ticks: { color: '#aaa' }, grid: { color: 'rgba(255, 255, 255, 0.1)' } },
      y: { ticks: { color: '#aaa' }, grid: { color: 'rgba(255, 255, 255, 0.1)' } }
    }
  };

  const data = {
    labels: matches.map((match, index) => `Partida ${index + 1} (${match.playerStats.agent})`),
    datasets: [
      {
        label: 'ACS',
        data: matches.map(match => match.playerStats.score),
        backgroundColor: 'rgba(253, 69, 86, 0.6)',
        borderColor: '#fd4556',
        borderWidth: 1,
      },
    ],
  };

  return <Bar options={options} data={data} />;
};

export default PerformanceChart;