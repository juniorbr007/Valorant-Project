// client/src/components/ModelComparisonChart/ModelComparisonChart.js

import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { BarWithErrorBarsController, BarWithErrorBar } from 'chartjs-chart-error-bars';

// Registra os componentes necessários
ChartJS.register(
  CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend,
  BarWithErrorBarsController, BarWithErrorBar
);

const ModelComparisonChart = ({ results }) => {
  // --- LÓGICA DE TRANSFORMAÇÃO DE DADOS (VERSÃO CORRIGIDA) ---

  // Pega os nomes dos modelos para as legendas do eixo X
  const labels = results.map(r => r.model);
  
  // Função para extrair os DADOS (médias) de uma métrica
  const getMeanData = (metricName) => {
    return results.map(r => {
      const meanValue = r[`mean_${metricName}`];
      // Para o F1-Score, que não é %, multiplicamos por 100 para ficar na mesma escala
      if (metricName === 'f1') {
        return parseFloat(meanValue) * 100;
      }
      return parseFloat(meanValue.replace('%', ''));
    });
  };

  // Função para extrair as BARRAS DE ERRO (desvio padrão)
  const getStdData = (metricName) => {
    const errorData = {};
    results.forEach(r => {
      const stdValue = r[`std_${metricName}`];
      // Para o F1-Score, multiplicamos por 100
      if (metricName === 'f1') {
        const std = parseFloat(stdValue.replace('± ', '')) * 100;
        errorData[r.model] = { plus: std, minus: std };
      } else {
        const std = parseFloat(stdValue.replace('± ', '').replace('%', ''));
        errorData[r.model] = { plus: std, minus: std };
      }
    });
    return errorData;
  };

  const data = {
    labels,
    datasets: [
      {
        label: 'Acurácia Média',
        data: getMeanData('accuracy'),
        errorBars: getStdData('accuracy'), // Propriedade para barras de erro
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
      },
      {
        label: 'Precisão Média',
        data: getMeanData('precision'),
        errorBars: getStdData('precision'),
        backgroundColor: 'rgba(255, 159, 64, 0.6)',
        borderColor: 'rgba(255, 159, 64, 1)',
      },
      {
        label: 'Revocação Média',
        data: getMeanData('recall'),
        errorBars: getStdData('recall'),
        backgroundColor: 'rgba(153, 102, 255, 0.6)',
        borderColor: 'rgba(153, 102, 255, 1)',
      },
      {
        label: 'F1-Score Médio',
        data: getMeanData('f1'),
        errorBars: getStdData('f1'),
        backgroundColor: 'rgba(255, 99, 132, 0.6)',
        borderColor: 'rgba(255, 99, 132, 1)',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top', labels: { color: '#fafafa' }},
      title: {
        display: true,
        text: 'Comparativo de Performance dos Modelos (Média e Desvio Padrão)',
        color: '#fafafa',
        font: { size: 18, family: "'Teko', sans-serif" }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const mean = context.parsed.y;
            const std = context.dataset.errorBars[context.label].plus;
            return `${context.dataset.label}: ${mean.toFixed(2)}% (± ${std.toFixed(2)}%)`;
          }
        }
      }
    },
    scales: {
      y: {
        min: 90, // Ajuste o mínimo para focar na diferença entre os modelos
        max: 100.5,
        ticks: { 
          color: '#aaa',
          callback: function(value) { return value + "%" }
        },
        grid: { color: 'rgba(255, 255, 255, 0.1)' }
      },
      x: { ticks: { color: '#aaa' }, grid: { display: false }}
    }
  };
  
  // Note que não usamos mais o 'type' aqui. O controller é registrado globalmente.
  return <Bar options={options} data={data} />;
};

export default ModelComparisonChart;