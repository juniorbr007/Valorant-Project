import React, { useState, useEffect } from 'react';
import './LolModelLabPage.css';

// Importa os componentes de visualização da nossa pasta compartilhada
import ModelResultCard from 'shared/ModelResultCard/ModelResultCard';
import ModelComparisonChart from 'shared/ModelComparisonChart/ModelComparisonChart';
import ConfusionMatrix from 'shared/ConfusionMatrix/ConfusionMatrix';

const LolModelLabPage = ({ playerData }) => {
  // --- ESTADOS DO COMPONENTE ---
  const [modelResults, setModelResults] = useState([]);
  const [runInfo, setRunInfo] = useState(null);
  const [isModelRunning, setIsModelRunning] = useState(false);
  const [tableData, setTableData] = useState([]);
  const [isLoadingTable, setIsLoadingTable] = useState(true);
  const [gameMode, setGameMode] = useState('ARAM'); // Estado para o seletor de modo de jogo

  // --- EFEITOS (BUSCA DE DADOS INICIAL) ---
  useEffect(() => {
    // Busca a amostra do dataset para exibir na tabela ao carregar a página
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
  }, []); // O array vazio [] garante que rode apenas uma vez

  // --- FUNÇÃO PRINCIPAL (EXECUTAR MODELOS) ---
  const runModels = async () => {
    if (!playerData?.puuid) {
      setRunInfo("Erro: Por favor, busque um jogador na aba 'Análise de Partidas' primeiro.");
      return;
    }

    setIsModelRunning(true);
    setModelResults([]);
    setRunInfo(`Executando modelos para ${playerData.gameName} (Modo: ${gameMode})...`);
    
    try {
      // Chama a rota dinâmica, passando o PUUID e o MODO DE JOGO
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/lol/run-classifier/${playerData.puuid}/${gameMode}`);
      const data = await response.json();

      if (!response.ok) throw new Error(data.message || 'Erro no servidor.');
      
      if (data.results) {
        setModelResults(data.results);
        setRunInfo(`Análise concluída para o modo ${gameMode}: ${data.dataset_size} partidas de ${playerData.gameName} foram processadas.`);
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

  // --- RENDERIZAÇÃO DO COMPONENTE ---
  return (
    <div className="model-lab-container">
      <h2 className="page-title">Laboratório de Modelos Preditivos (LoL)</h2>
      <p className="page-description">
        Selecione um modo de jogo e execute a pipeline de Machine Learning. O sistema irá filtrar o dataset salvo, treinar os modelos e exibir os resultados da performance preditiva abaixo.
      </p>

      <div className="data-explanation-card">
        <h3>Origem e Impacto dos Dados</h3>
        <p>Os dados utilizados neste laboratório foram coletados diretamente da API oficial da Riot Games. Cada linha da tabela abaixo representa o desempenho individual de um jogador em uma única partida.</p>
        <p>O objetivo é utilizar estas estatísticas (KDA, Ouro, Visão, etc.) como "features" para treinar modelos capazes de prever a variável alvo: <strong>Vitória (1)</strong> ou <strong>Derrota (0)</strong>.</p>
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
            <h3>Comparativo de Acurácia Geral</h3>
            <ModelComparisonChart results={modelResults} />
          </div>

          {/* Mapeia os resultados para criar uma seção detalhada para cada modelo */}
          {modelResults.map((result, index) => (
            <div key={index} className="model-deep-dive">
              <ModelResultCard results={result} />
              <ConfusionMatrix matrix={result.confusion_matrix} modelName={result.model_name} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LolModelLabPage;
