import React, { useState, useEffect } from 'react';
import './LolModelLabPage.css';

// Suas importações existentes, todas corretas
import ModelResultCard from 'shared/ModelResultCard/ModelResultCard';
import ModelComparisonChart from 'shared/ModelComparisonChart/ModelComparisonChart';
import ConfusionMatrix from 'shared/ConfusionMatrix/ConfusionMatrix';

const LolModelLabPage = ({ playerData }) => {
 // --- SEUS ESTADOS EXISTENTES ---
 const [modelResults, setModelResults] = useState([]);
 const [runInfo, setRunInfo] = useState(null);
 const [isModelRunning, setIsModelRunning] = useState(false);
 const [tableData, setTableData] = useState([]);
 const [isLoadingTable, setIsLoadingTable] = useState(true);
 const [gameMode, setGameMode] = useState('ALL'); // Alterado para 'ALL' como padrão
 
 const [isAnalyzingFeatures, setIsAnalyzingFeatures] = useState(false);
 const [featureImportanceImg, setFeatureImportanceImg] = useState(null);
 const [featureError, setFeatureError] = useState('');

  // --- NOVOS ESTADOS PARA O GRÁFICO DE NEMENYI ---
  const [nemenyiPlotUrl, setNemenyiPlotUrl] = useState(null);
  const [isLoadingPlot, setIsLoadingPlot] = useState(false);
  const [plotError, setPlotError] = useState('');

 // --- EFEITOS (Sem alterações) ---
 useEffect(() => {
  const fetchTrainingData = async () => {
      // Esta função pode dar um erro 404 se o arquivo não existir, é esperado.
      // Vamos tratar isso para não quebrar a página.
   setIsLoadingTable(true);
   try {
    const response = await fetch(`${process.env.REACT_APP_API_URL}/api/lol/training-data`);
        if (!response.ok) { 
          // Se o arquivo não existe, apenas mostramos uma tabela vazia.
          setTableData([]);
          return; 
        };
    const data = await response.json();
    setTableData(data);
   } catch (error) {
    console.error("Erro ao buscar dados da tabela (pode ser normal se o arquivo ainda não foi gerado):", error);
    setTableData([]);
   } finally {
    setIsLoadingTable(false);
   }
  };
  fetchTrainingData();
 }, []); 

 // --- FUNÇÕES HANDLER (com a nova função adicionada) ---

 const runModels = async () => {
  if (!playerData?.puuid) {
   setRunInfo("Erro: Por favor, busque um jogador na aba 'Análise de Partidas' primeiro.");
   return;
  }

  setIsModelRunning(true);
  setModelResults([]);
    // Limpa todos os gráficos e erros antigos ao iniciar uma nova corrida
  setFeatureImportanceImg(null);
  setNemenyiPlotUrl(null);
  setFeatureError('');
    setPlotError('');
  setRunInfo(`Executando modelos para ${playerData.gameName} (Modo: ${gameMode})...`);
  
  try {
   const response = await fetch(`${process.env.REACT_APP_API_URL}/api/lol/run-classifier/${playerData.puuid}/${gameMode}`);
   const data = await response.json();

   if (!response.ok) throw new Error(data.message || 'Erro no servidor.');
   
   if (data.results) {
    setModelResults(data.results);
    setRunInfo(`Análise concluída para o modo ${gameMode}: ${data.dataset_size} partidas de ${playerData.gameName} foram processadas.`);
   } else {
        // Se o backend retornar um erro estruturado (ex: dados insuficientes)
        throw new Error(data.error || "Ocorreu um erro desconhecido na análise.");
   }
  } catch (err) {
   console.error("Erro ao rodar os modelos:", err);
   setRunInfo(`Falha: ${err.message}`);
  } finally {
   setIsModelRunning(false);
  }
 };

 const handleFeatureAnalysis = async () => {
    // (Sua função original, sem alterações)
  if (!playerData?.puuid) {
   setFeatureError("Por favor, busque um jogador primeiro.");
   return;
  }
  setIsAnalyzingFeatures(true);
  setFeatureImportanceImg(null);
  setFeatureError('');
  try {
   const response = await fetch(`${process.env.REACT_APP_API_URL}/api/lol/feature-importance/${playerData.puuid}`);
   if (!response.ok) {
    const errData = await response.json();
    throw new Error(errData.message || 'Erro no servidor ao gerar o gráfico.');
   }
   const imageBlob = await response.blob();
   const imageUrl = URL.createObjectURL(imageBlob);
   setFeatureImportanceImg(imageUrl);
  } catch (err) {
   setFeatureError(err.message);
  } finally {
   setIsAnalyzingFeatures(false);
  }
 };

  // --- NOVA FUNÇÃO PARA O GRÁFICO DE NEMENYI ---
  const handleGenerateNemenyiPlot = async () => {
    setIsLoadingPlot(true);
    setNemenyiPlotUrl(null);
    setPlotError('');
    try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/lol/statistical-analysis`);

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Falha ao gerar o gráfico.');
        }

        const imageBlob = await response.blob();
        const imageUrl = URL.createObjectURL(imageBlob);
        setNemenyiPlotUrl(imageUrl);

    } catch (error) {
        console.error("Erro ao gerar o gráfico de Nemenyi:", error);
        setPlotError(error.message);
    } finally {
        setIsLoadingPlot(false);
    }
  };


 // --- RENDERIZAÇÃO DO COMPONENTE ---
 return (
  <div className="model-lab-container">
   <h2 className="page-title">Laboratório de Modelos Preditivos (LoL)</h2>
   <p className="page-description">
        Selecione um modo de jogo e execute a pipeline de Machine Learning para avaliar a performance de diferentes modelos na tarefa de prever o resultado de partidas.
   </p>
        
      {/* ... Sua seção de tabela e explicação de dados (sem alterações) ... */}
      <div className="data-explanation-card">
        <h3>Origem e Impacto dos Dados</h3>
        <p>Os dados utilizados neste laboratório foram coletados diretamente da API oficial da Riot Games. Cada linha da tabela abaixo representa o desempenho individual de um jogador em uma única partida.</p>
        <p>O objetivo é utilizar estas estatísticas (KDA, Ouro, Visão, etc.) como "features" para treinar modelos capazes de prever a variável alvo: <strong>Vitória (1)</strong> ou <strong>Derrota (0)</strong>.</p>
      </div>
      <div className="data-table-container">
        <h3>Amostra do Dataset (`lol_player_stats.csv`)</h3>
        {isLoadingTable ? (<p>Carregando...</p>) : (
          <table>
            <thead><tr>{tableData.length > 0 && Object.keys(tableData[0]).map(header => <th key={header}>{header}</th>)}</tr></thead>
            <tbody>{tableData.slice(0, 5).map((row, rowIndex) => (<tr key={rowIndex}>{Object.values(row).map((value, colIndex) => <td key={colIndex}>{String(value)}</td>)}</tr>))}</tbody>
          </table>
        )}
      </div>


   <div className="run-model-container">
        <div className="settings-box">
            <label htmlFor="game-mode-select">Analisar Modo de Jogo:</label>
            <select id="game-mode-select" value={gameMode} onChange={(e) => setGameMode(e.target.value)}>
                <option value="ALL">Todos os Modos</option>
                <option value="CLASSIC">Ranked/Normal (SR)</option>
                <option value="ARAM">ARAM</option>
                <option value="CHERRY">Arena (2v2v2v2)</option>
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
            {modelResults.map((result, index) => (
                <div key={index} className="model-deep-dive">
                    <ModelResultCard results={result} />
                    <ConfusionMatrix matrix={result.confusion_matrix} modelName={result.model_name} />
                </div>
            ))}

            {/* --- NOVA SEÇÃO INTEGRADA PARA ANÁLISE ESTATÍSTICA --- */}
            <div className="statistical-analysis-container">
                <h3>Análise Estatística (Teste de Nemenyi)</h3>
                <p>
                  Esta análise executa o teste de Friedman e gera o gráfico de Nemenyi para comparar estatisticamente a performance dos modelos. Modelos conectados por uma linha horizontal não possuem uma diferença significativa.
                </p>
                <button onClick={handleGenerateNemenyiPlot} disabled={isLoadingPlot} className="run-analysis-button">
                    {isLoadingPlot ? 'Gerando Gráfico...' : 'Gerar Gráfico de Comparação'}
                </button>
                {plotError && <p className="error-message">{plotError}</p>}
                {nemenyiPlotUrl && (
                    <div className="chart-image-wrapper">
                        <img src={nemenyiPlotUrl} alt="Gráfico de Comparação Estatística (Nemenyi)" />
                    </div>
                )}
            </div>

        </div>
   )}

   <div className="feature-analysis-container">
        {/* ... Sua seção de análise de features (sem alterações) ... */}
        <h3>Análise de Relevância das Features</h3>
        <p>
          Esta análise treina nosso melhor modelo (Random Forest) com todos os dados do jogador e pergunta: "Quais fatores foram mais importantes para prever uma vitória?". O gráfico mostra o peso de cada variável na decisão do modelo.
        </p>
        <button onClick={handleFeatureAnalysis} disabled={isAnalyzingFeatures} className="run-analysis-button">
            {isAnalyzingFeatures ? 'Analisando...' : 'Gerar Gráfico de Importância'}
        </button>
        {featureError && <p className="error-message">{featureError}</p>}
        {isAnalyzingFeatures && <p className="loading-message">Gerando gráfico...</p>}
        {featureImportanceImg && (
            <div className="chart-image-wrapper">
                <img src={featureImportanceImg} alt="Gráfico de Importância das Features" />
            </div>
        )}
   </div>
  </div>
 );
};

export default LolModelLabPage;