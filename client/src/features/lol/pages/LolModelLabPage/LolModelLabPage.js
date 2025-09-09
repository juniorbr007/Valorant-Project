import React, { useState, useEffect } from 'react';
import './LolModelLabPage.css';
import ModelResultCard from 'shared/ModelResultCard/ModelResultCard';
import ModelComparisonChart from 'shared/ModelComparisonChart/ModelComparisonChart';

const LolModelLabPage = ({ playerData }) => {
  const [modelResults, setModelResults] = useState([]);
  const [runInfo, setRunInfo] = useState(null);
  const [isModelRunning, setIsModelRunning] = useState(false);
  const [tableData, setTableData] = useState([]);
  const [isLoadingTable, setIsLoadingTable] = useState(true);
  
  // --- NOVO: Estado para controlar o modo de jogo selecionado ---
  const [gameMode, setGameMode] = useState('ARAM'); // 'ARAM' será o padrão

  // useEffect para buscar a amostra do CSV (sem alterações)
  useEffect(() => {
    const fetchTrainingData = async () => {
      // ... (sua lógica existente para buscar a tabela)
    };
    fetchTrainingData();
  }, []);

  const runModels = async () => {
    if (!playerData?.puuid) {
      setRunInfo("Erro: Por favor, busque um jogador na aba 'Análise de Partidas' primeiro.");
      return;
    }

    setIsModelRunning(true);
    setModelResults([]);
    // Mensagem de status agora inclui o modo de jogo
    setRunInfo(`Executando modelos para ${playerData.gameName} (Modo: ${gameMode})...`);
    
    try {
      // --- ATUALIZADO: A URL agora inclui o modo de jogo dinamicamente ---
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/lol/run-classifier/${playerData.puuid}/${gameMode}`);
      
      const data = await response.json();
      if (!response.ok) { throw new Error(data.message || 'Erro no servidor.'); }

      if (data.results) {
        setModelResults(data.results);
        setRunInfo(`Análise concluída para o modo ${gameMode}: ${data.dataset_size} partidas de ${playerData.gameName} foram processadas.`);
      } else {
        // Exibe a mensagem de erro do backend se não houver partidas para aquele modo
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
        Selecione um modo de jogo e execute a pipeline de Machine Learning. O sistema irá filtrar o dataset salvo, treinar os modelos e exibir os resultados da performance preditiva abaixo.
      </p>

      {/* ... (sua seção de explicação e tabela de dados) ... */}

      <div className="run-model-container">
        {/* --- NOVO: Seletor de Modo de Jogo --- */}
        <div className="settings-box">
          <label htmlFor="game-mode-select">Analisar Modo de Jogo:</label>
          <select id="game-mode-select" value={gameMode} onChange={(e) => setGameMode(e.target.value)}>
            <option value="ARAM">ARAM</option>
            <option value="CLASSIC">Ranked/Normal (SR)</option>
            <option value="CHERRY">Arena (2v2v2v2)</option>
            <option value="ALL">Todos os Modos</option>
          </select>
        </div>
        
        <button onClick={runModels} disabled={isModelRunning} className="run-model-button">
          {isModelRunning ? 'Processando...' : 'Rodar Modelos'}
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