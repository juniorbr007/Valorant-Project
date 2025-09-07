import React, { useState } from 'react';
import './ModelLabPage.css';

// --- IMPORTAÇÕES CORRIGIDAS E SIMPLIFICADAS ---
// Agora todos os componentes necessários vêm da mesma pasta vizinha.
import ModelResultCard from '../../../../shared/ModelResultCard/ModelResultCard';
import ModelComparisonChart from '../../../../shared/ModelComparisonChart/ModelComparisonChart';
import PredictionSimulator from '../../components/PredictionSimulator/PredictionSimulator'; 

const ModelLabPage = () => {
  const [modelResults, setModelResults] = useState([]);
  const [isModelRunning, setIsModelRunning] = useState(false);
  const [runInfo, setRunInfo] = useState(null);

  const runModels = async () => {
    setIsModelRunning(true);
    setModelResults([]);
    setRunInfo("Executando modelos com validação cruzada, isso pode levar um momento...");
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/run-classifier`);
      if (!response.ok) {
        throw new Error(`Erro na API: ${response.statusText}`);
      }
      const data = await response.json();

      if (data.results) {
        setModelResults(data.results);
        setRunInfo(`Validação cruzada (k=${data.cv_folds}) concluída em ${data.dataset_size} partidas.`);
      } else {
        setRunInfo(data.error || "Ocorreu um erro desconhecido ao processar os resultados.");
      }
    } catch (err) {
      console.error("Erro ao rodar os modelos:", err);
      setRunInfo("Falha de comunicação com o servidor. Verifique se o backend está rodando.");
    } finally {
      setIsModelRunning(false);
    }
  };

  return (
    // Usando React.Fragment (<>) para não adicionar uma <div> extra desnecessária
    <>
      <section className="model-lab-container">
        <h2 className="page-title">Laboratório de Modelos Preditivos</h2>
        <p className="page-description">
          Execute e compare modelos usando a Validação Cruzada para avaliar a performance e a consistência de cada classificador. Os resultados são exibidos visualmente para uma análise comparativa clara.
        </p>
        
        <button onClick={runModels} disabled={isModelRunning} className="run-model-button">
          {isModelRunning ? 'Processando...' : 'Rodar Validação Cruzada'}
        </button>

        {runInfo && <p className="run-info-text">{runInfo}</p>}
        
        {modelResults.length > 0 && (
          <div className="results-section">
            <div className="chart-wrapper">
              <ModelComparisonChart results={modelResults} />
            </div>
            <div className="results-grid">
              {modelResults.map((result, index) => (
                <ModelResultCard key={index} results={result} />
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Seção do Simulador de Predição */}
      <PredictionSimulator />
    </>
  );
};

export default ModelLabPage;