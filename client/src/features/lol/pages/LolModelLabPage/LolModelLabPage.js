import React, { useState, useEffect } from 'react';
import './LolModelLabPage.css';

// Importações absolutas dos nossos componentes de gráfico compartilhados
import ModelResultCard from 'shared/ModelResultCard/ModelResultCard';
import ModelComparisonChart from 'shared/ModelComparisonChart/ModelComparisonChart';

// 1. O componente agora recebe 'playerData' como uma propriedade (prop)
const LolModelLabPage = ({ playerData }) => {
  const [modelResults, setModelResults] = useState([]);
  const [runInfo, setRunInfo] = useState(null);
  const [isModelRunning, setIsModelRunning] = useState(false);
  const [tableData, setTableData] = useState([]);
  const [isLoadingTable, setIsLoadingTable] = useState(true);

  // useEffect para buscar os dados do CSV (sem alterações)
  useEffect(() => {
    const fetchTrainingData = async () => {
      setIsLoadingTable(true);
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/lol/training-data`);
        const data = await response.json();
        if (!response.ok) throw new Error("Falha ao carregar dados da tabela.");
        setTableData(data);
      } catch (error) {
        console.error("Erro ao buscar dados da tabela:", error);
        setTableData([]);
      } finally {
        setIsLoadingTable(false);
      }
    };
    fetchTrainingData();
  }, []);

  // Função para rodar os modelos, agora específica para um jogador
  const runModels = async () => {
    // 2. Adicionamos uma verificação: se nenhum jogador foi buscado, exibe um aviso.
    if (!playerData?.puuid) {
      setRunInfo("Erro: Por favor, busque um jogador na aba 'Análise de Partidas' primeiro.");
      return;
    }

    setIsModelRunning(true);
    setModelResults([]);
    // Mensagem de status personalizada com o nome do jogador
    setRunInfo(`Executando modelos para ${playerData.gameName}, isso pode levar um momento...`);
    
    try {
      // 3. A CHAMADA DA API AGORA É DINÂMICA
      // Usamos o PUUID do jogador para chamar a nova rota do backend.
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/lol/run-classifier/${playerData.puuid}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erro no servidor.');
      }
      if (data.results) {
        setModelResults(data.results);
        setRunInfo(`Validação cruzada (k=${data.cv_folds}) concluída com ${data.dataset_size} partidas de ${playerData.gameName}.`);
      } else {
        setRunInfo(data.error || "Ocorreu um erro desconhecido.");
      }
    } catch (err) {
      console.error("Erro ao rodar os modelos:", err);
      setRunInfo("Falha ao comunicar com o servidor.");
    } finally {
      setIsModelRunning(false);
    }
  };

  return (
    <div className="model-lab-container">
      <h2 className="page-title">Laboratório de Modelos Preditivos (LoL)</h2>
      <p className="page-description">
        Execute e compare modelos de Machine Learning utilizando o dataset real coletado do League of Legends. Os resultados da Validação Cruzada são exibidos abaixo.
      </p>

      <div className="data-explanation-card">
        <h3>Origem e Impacto dos Dados</h3>
        <p>
          Os dados utilizados neste laboratório foram coletados diretamente da API oficial da Riot Games. Cada linha da tabela abaixo representa o desempenho individual de um jogador em uma única partida.
        </p>
        <p>
          O objetivo é utilizar estas estatísticas (KDA, Ouro, Visão, etc.) como "features" para treinar modelos capazes de prever a variável alvo: <strong>Vitória (1)</strong> ou <strong>Derrota (0)</strong>.
        </p>
      </div>

      <div className="data-table-container">
        <h3>Amostra do Dataset (`lol_player_stats.csv`)</h3>
        {isLoadingTable ? (
          <p className="loading-table-text">Carregando dados...</p>
        ) : (
          <table>
            <thead>
              <tr>
                {tableData.length > 0 && Object.keys(tableData[0]).map(header => <th key={header}>{header}</th>)}
              </tr>
            </thead>
            <tbody>
              {tableData.slice(0, 10).map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {Object.values(row).map((value, colIndex) => <td key={colIndex}>{String(value)}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="run-model-container">
        <button onClick={runModels} disabled={isModelRunning} className="run-model-button">
          {isModelRunning ? 'Processando...' : 'Rodar Modelos para o Jogador Atual'}
        </button>
        {runInfo && <p className="run-info-text">{runInfo}</p>}
      </div>
      
      {modelResults.length > 0 && (
        <div className="results-section">
          <div className="chart-wrapper">
            <h3>Comparativo de Acurácia</h3>
            <ModelComparisonChart results={modelResults} />
          </div>
          <div className="results-grid">
            {modelResults.map((result, index) => (
              <ModelResultCard key={index} results={result} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LolModelLabPage;
