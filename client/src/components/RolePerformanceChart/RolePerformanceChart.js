import React from 'react';
import { Radar } from 'react-chartjs-2';
import { Chart as ChartJS, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend } from 'chart.js';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

const RolePerformanceChart = ({ matches }) => {
  // 1. Mapeamento de Agente para Função
  const agentRoles = {
    'Jett': 'Duelista', 'Reyna': 'Duelista', 'Raze': 'Duelista', 'Phoenix': 'Duelista', 'Yoru': 'Duelista', 'Neon': 'Duelista', 'Iso': 'Duelista',
    'Omen': 'Controlador', 'Brimstone': 'Controlador', 'Viper': 'Controlador', 'Astra': 'Controlador', 'Harbor': 'Controlador', 'Clove': 'Controlador',
    'Killjoy': 'Sentinela', 'Cypher': 'Sentinela', 'Sage': 'Sentinela', 'Chamber': 'Sentinela', 'Deadlock': 'Sentinela',
    'Sova': 'Iniciador', 'Skye': 'Iniciador', 'KAY/O': 'Iniciador', 'Breach': 'Iniciador', 'Fade': 'Iniciador', 'Gekko': 'Iniciador',
  };

  // 2. Processamento dos dados para agregar por função
  const roleStats = matches.reduce((acc, match) => {
    const agentName = match.playerStats.agent;
    const role = agentRoles[agentName] || 'Desconhecido';

    if (!acc[role]) {
      acc[role] = { wins: 0, kills: 0, deaths: 0, assists: 0, totalAcs: 0, matchCount: 0 };
    }

    if (match.result === 'Vitória') acc[role].wins++;
    acc[role].kills += match.playerStats.kills;
    acc[role].deaths += match.playerStats.deaths;
    acc[role].assists += match.playerStats.assists;
    acc[role].totalAcs += match.playerStats.score;
    acc[role].matchCount++;

    return acc;
  }, {});

  // 3. Normalização e preparação dos dados para o gráfico
  const roles = Object.keys(roleStats);
  const datasets = roles.map((role, index) => {
    const stats = roleStats[role];
    const winRate = (stats.wins / stats.matchCount) * 100;
    const kda = stats.deaths > 0 ? (stats.kills + stats.assists) / stats.deaths : (stats.kills + stats.assists);
    const avgAcs = stats.totalAcs / stats.matchCount;

    // Normalizamos os dados para que fiquem bem no gráfico (ex: de 0 a 100)
    const normalizedKDA = Math.min(kda * 20, 100); // KDA de 5.0 = 100
    const normalizedAcs = Math.min(avgAcs / 3.5, 100); // ACS de 350 = 100

    const colors = [
      'rgba(253, 69, 86, 0.4)',  // Duelista (Vermelho)
      'rgba(75, 192, 192, 0.4)', // Controlador (Verde-água)
      'rgba(255, 206, 86, 0.4)', // Sentinela (Amarelo)
      'rgba(54, 162, 235, 0.4)', // Iniciador (Azul)
    ];

    return {
      label: role,
      data: [winRate, normalizedKDA, normalizedAcs],
      backgroundColor: colors[index % colors.length],
      borderColor: colors[index % colors.length].replace('0.4', '1'),
      borderWidth: 1,
    };
  });

  const data = {
    labels: ['Taxa de Vitória (%)', 'KDA (Normalizado)', 'ACS (Normalizado)'],
    datasets: datasets,
  };

  const options = { 

     responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top', labels: { color: '#fafafa', font: { size: 14 } } },
      title: {
        display: true,
        text: 'Análise de Performance por Função',
        color: '#fafafa',
        font: { size: 18, family: "'Teko', sans-serif" }
      },
    },
    scales: {
      r: { // Configurações da escala radial (do centro para fora)
        angleLines: { color: 'rgba(255, 255, 255, 0.2)' },
        grid: { color: 'rgba(255, 255, 255, 0.2)' },
        pointLabels: {
          color: '#fafafa',
          font: { size: 12, family: "'Roboto', sans-serif" }
        },
        ticks: {
          color: '#1a1a1a',
          backdropColor: 'rgba(255, 255, 255, 0.8)',
          stepSize: 20
        },
        min: 0,
        max: 100
      }
    }
   }; // Adicionaremos as opções abaixo

  return <Radar data={data} options={options} />;
};

export default RolePerformanceChart;