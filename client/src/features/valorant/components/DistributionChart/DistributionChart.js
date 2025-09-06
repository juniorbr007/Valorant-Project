import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

// Registra os componentes necessários do Chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const DistributionChart = ({ matches }) => {
  // 1. Processamento dos Dados
  // Agrupa as partidas em faixas de ACS (Average Combat Score)
  const processData = () => {
    const bins = {
      '< 150': 0,
      '150-200': 0,
      '201-250': 0,
      '251-300': 0,
      '> 300': 0,
    };

    if (!matches || matches.length === 0) {
      return bins;
    }

    matches.forEach(match => {
      // Usando 'acs' diretamente, como no nosso mock data
      const acs = match.playerStats.acs;
      if (acs < 150) bins['< 150']++;
      else if (acs <= 200) bins['150-200']++;
      else if (acs <= 250) bins['201-250']++;
      else if (acs <= 300) bins['251-300']++;
      else bins['> 300']++;
    });

    return bins;
  };

  const processedData = processData();

  // 2. Configuração do Gráfico para o Chart.js
  const chartData = {
    labels: Object.keys(processedData),
    datasets: [
      {
        label: 'Número de Partidas',
        data: Object.values(processedData),
        backgroundColor: 'rgba(0, 255, 255, 0.6)',
        borderColor: 'rgba(0, 255, 255, 1)',
        borderWidth: 1,
        borderRadius: 5,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false, // Importante para se adaptar ao container
    plugins: {
      legend: {
        display: false, // O título do card já é suficiente
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
        beginAtZero: true,
        grid: {
          color: 'rgba(71, 85, 105, 0.5)',
        },
        ticks: {
          color: '#cbd5e1',
          precision: 0, // Garante que o eixo Y não tenha casas decimais
        },
      },
      x: {
        grid: {
          display: false, // Remove as linhas de grade verticais
        },
        ticks: {
          color: '#cbd5e1',
        },
      },
    },
  };

  // 3. Renderização do Componente
  return (
    // O container precisa de altura para o gráfico ser exibido
    <div style={{ position: 'relative', height: '100%', width: '100%' }}>
      <Bar options={chartOptions} data={chartData} />
    </div>
  );
};

export default DistributionChart;

