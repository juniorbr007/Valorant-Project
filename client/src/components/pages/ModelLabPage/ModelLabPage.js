import React, { useState } from 'react';
import './ModelLabPage.css';
import ModelResultCard from '../../ModelResultCard/ModelResultCard';
import ModelComparisonChart from '../../charts/ModelComparisonChart/ModelComparisonChart';
import PredictionSimulator from '../../PredictionSimulator/PredictionSimulator'; 

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
      const data = await response.json();

      if (data.results) {
        setModelResults(data.results);
        setRunInfo(`Validação cruzada (k=${data.cv_folds}) concluída em ${data.dataset_size} partidas.`);
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
    // 1. Adicionamos uma <div> principal para envolver as duas seções
    <div>
      <section className="model-lab-container">
        <h2>Laboratório de Modelos Preditivos</h2>
        <p>Execute e compare modelos usando a Validação Cruzada para avaliar a performance e a consistência de cada classificador. Os resultados são exibidos visualmente para uma análise comparativa clara.</p>
        
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

      {/* --- 2. ADIÇÃO DA NOVA SEÇÃO DO SIMULADOR --- */}
      {/* O componente do simulador é adicionado aqui, fora da primeira seção */}
      <PredictionSimulator />

    </div>
  );
};

export default ModelLabPage;