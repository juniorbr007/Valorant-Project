import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// Função auxiliar para formatar os nomes das métricas
const formatLabel = (label) => {
  if (!label) return ''; // Proteção contra 'undefined'
  return label.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
};

const ModelComparisonChart = ({ results }) => {
  // Adiciona uma verificação de segurança para evitar erros se os dados não chegarem
  if (!results || results.length === 0) {
    return <div>Aguardando resultados dos modelos...</div>;
  }

  // --- AJUSTE CRÍTICO AQUI ---
  // Trocamos 'model' por 'model_name' para bater com o JSON do nosso script Python do LoL.
  const labels = results.map(result => formatLabel(result.model_name));

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Acurácia',
        // Garantimos que estamos mapeando a propriedade 'accuracy' corretamente
        data: results.map(result => result.accuracy),
        backgroundColor: 'rgba(0, 255, 255, 0.6)',
        borderColor: 'rgba(0, 255, 255, 1)',
        borderWidth: 1,
      },
      {
        label: 'F1-Score',
        // Garantimos que estamos mapeando a propriedade 'f1_score' corretamente
        data: results.map(result => result.f1_score),
        backgroundColor: 'rgba(255, 0, 193, 0.6)',
        borderColor: 'rgba(255, 0, 193, 1)',
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    indexAxis: 'y', // Deixa o gráfico na horizontal, melhor para comparar nomes
    plugins: {
      legend: {
        position: 'top',
        labels: { color: '#f0f0f0' }
      },
      title: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.x !== null) {
              // Formata para exibir como porcentagem
              label += (context.parsed.x * 100).toFixed(2) + '%';
            }
            return label;
          }
        }
      }
    },
    scales: {
      x: {
        beginAtZero: true,
        max: 1.0, // A escala vai de 0 a 1 (0% a 100%)
        ticks: { 
          color: '#cbd5e1',
          callback: function(value) {
            return value * 100 + '%'; // Mostra os ticks como porcentagem
          }
        },
        grid: {
          color: 'rgba(71, 85, 105, 0.5)'
        }
      },
      y: {
        ticks: { color: '#cbd5e1', font: { size: 14 } },
        grid: {
          color: 'rgba(71, 85, 105, 0.2)'
        }
      },
    },
  };

  return <Bar options={chartOptions} data={chartData} />;
};

export default ModelComparisonChart;
