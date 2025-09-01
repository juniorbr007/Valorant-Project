import React from 'react';
import { Scatter } from 'react-chartjs-2';
import { Chart as ChartJS, LinearScale, PointElement, LineElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(LinearScale, PointElement, LineElement, Tooltip, Legend);

const ScatterPlotChart = ({ matches }) => {
  // --- LÓGICA DE PROCESSAMENTO DE DADOS ---
  const processMatchData = (match) => {
    const { kills, deaths, assists, score } = match.playerStats;
    const kda = deaths > 0 ? ((kills + assists) / deaths) : (kills + assists); // Evita divisão por zero
    return { x: kda, y: score };
  };

  const victoryData = matches
    .filter(match => match.result === 'Vitória')
    .map(processMatchData);

  const defeatData = matches
    .filter(match => match.result === 'Derrota')
    .map(processMatchData);
  // --- FIM DO PROCESSAMENTO ---

  const data = {
    datasets: [
      {
        label: 'Vitória',
        data: victoryData,
        backgroundColor: 'rgba(76, 175, 80, 0.7)', // Verde
      },
      {
        label: 'Derrota',
        data: defeatData,
        backgroundColor: 'rgba(253, 69, 86, 0.7)', // Vermelho
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top', labels: { color: '#fafafa' } },
      title: {
        display: true,
        text: 'Relação entre KDA e ACS por Resultado da Partida',
        color: '#fafafa',
        font: { size: 18, family: "'Teko', sans-serif" }
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: { display: true, text: 'Pontuação de Combate (ACS)', color: '#aaa' },
        ticks: { color: '#aaa' },
        grid: { color: 'rgba(255, 255, 255, 0.1)' }
      },
      x: {
        beginAtZero: true,
        title: { display: true, text: 'KDA Ratio', color: '#aaa' },
        ticks: { color: '#aaa' },
        grid: { color: 'rgba(255, 255, 255, 0.1)' }
      },
    },
  };

  return <Scatter options={options} data={data} />;
};

export default ScatterPlotChart;