import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const DistributionChart = ({ matches }) => {
  // --- LÓGICA DE PROCESSAMENTO PARA CRIAR O HISTOGRAMA ---
  const scores = matches.map(match => match.playerStats.score);

  // Define as faixas (bins) para o ACS
  const bins = [100, 150, 200, 250, 300, 350, 400];
  const binLabels = bins.slice(0, -1).map((bin, index) => `${bin + 1}-${bins[index + 1]}`);

  const histogramData = new Array(binLabels.length).fill(0);

  scores.forEach(score => {
    for (let i = 0; i < bins.length - 1; i++) {
      if (score > bins[i] && score <= bins[i + 1]) {
        histogramData[i]++;
        break;
      }
    }
  });
  // --- FIM DO PROCESSAMENTO ---

  const data = {
    labels: binLabels,
    datasets: [{
      label: 'Número de Partidas',
      data: histogramData,
      backgroundColor: 'rgba(75, 192, 192, 0.6)',
      borderColor: 'rgb(75, 192, 192)',
      borderWidth: 1,
    }],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: 'Distribuição de Performance (Frequência de ACS)',
        color: '#fafafa',
        font: { size: 18, family: "'Teko', sans-serif" }
      },
    },
    scales: {
      x: {
        title: { display: true, text: 'Faixa de Pontuação de Combate (ACS)', color: '#aaa' },
        ticks: { color: '#aaa' },
        grid: { display: false }
      },
      y: {
        beginAtZero: true,
        title: { display: true, text: 'Nº de Partidas', color: '#aaa' },
        ticks: { color: '#aaa', stepSize: 1 },
        grid: { color: 'rgba(255, 255, 255, 0.1)' }
      },
    },
  };

  return <Bar data={data} options={options} />;
};

export default DistributionChart;