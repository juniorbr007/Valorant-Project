import React, { useState, useEffect } from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, Title } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend, Title);

const ClusterPieChart = ({ matches }) => {
  const [pieData, setPieData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const runClustering = async () => {
      // Garante que não vamos rodar a análise sem dados
      if (!matches || matches.length === 0) {
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      try {
        // 1. Prepara os dados corretos para enviar ao backend
        // Inclui o ID para consistência, embora não seja usado pelo gráfico de pizza
        const statsForClustering = matches.map(match => ({ ...match.playerStats, id: match.id }));

        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/run-clustering`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(statsForClustering),
        });

        if (!response.ok) {
          throw new Error('Falha na resposta do servidor de clustering.');
        }

        const data = await response.json();

        // 2. CORREÇÃO PRINCIPAL: Busca os dados dentro da chave 'pieChartData'
        if (data && data.pieChartData) {
          setPieData(data.pieChartData);
        } else {
          // Se a chave não existir, trata como um erro
          console.error("Estrutura de dados inesperada do clustering:", data);
          setPieData(null);
        }

      } catch (err) {
        console.error("Erro ao rodar o clustering para o gráfico:", err);
        setPieData(null); // Limpa os dados em caso de erro
      } finally {
        setIsLoading(false);
      }
    };

    runClustering();
  }, [matches]); // Roda o efeito sempre que a lista de 'matches' mudar

  // Mensagem de carregamento
  if (isLoading) {
    return <div>Calculando estilo de jogo...</div>;
  }

  // Mensagem caso não haja dados para exibir
  if (!pieData || pieData.length === 0) {
    return <div>Não foi possível classificar o estilo de jogo.</div>;
  }

  // Prepara os dados para o formato que o Chart.js espera
  const chartData = {
    labels: pieData.map(c => c.archetype),
    datasets: [{
      label: 'Distribuição de Estilo de Jogo',
      data: pieData.map(c => c.percentage),
      backgroundColor: [
        'rgba(253, 69, 86, 0.8)',   // Agressivo
        'rgba(75, 192, 192, 0.8)',  // Tático
        'rgba(153, 102, 255, 0.8)', // Âncora
        'rgba(255, 206, 86, 0.8)',  // Cor extra
      ],
      borderColor: '#2c2c2c',
      borderWidth: 3,
    }],
  };
  
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top', labels: { color: '#fafafa', font: { size: 14 } } },
      title: {
        display: true,
        text: 'Seu Estilo de Jogo (Resultado do Clustering)',
        color: '#fafafa',
        font: { size: 18, family: "'Teko', sans-serif" }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            let label = context.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed !== null) {
              label += context.parsed.toFixed(2) + '%';
            }
            return label;
          }
        }
      }
    }
  };

  return <Pie options={options} data={chartData} />;
};

export default ClusterPieChart;