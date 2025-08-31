import React, { useState } from 'react';
import './ModelLabPage.css'; // Vamos usar seu próprio CSS
import ModelResultCard from '../ModelResultCard/ModelResultCard';

const ModelLabPage = () => {
  const [modelResults, setModelResults] = useState(null);
  const [isModelRunning, setIsModelRunning] = useState(false);

  const runModels = async () => {
    setIsModelRunning(true);
    setModelResults(null);
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/run-classifier`);
      const data = await response.json();
      setModelResults(data);
    } catch (err) {
      console.error("Erro ao rodar o modelo:", err);
    } finally {
      setIsModelRunning(false);
    }
  };

  return (
    <section className="model-lab-container">
      <h2>Laboratório de Modelos Preditivos</h2>
      <p>Execute e compare diferentes modelos de Machine Learning para prever o resultado de partidas com base nos dados coletados. Esta seção demonstra a aplicação de classificadores como MLP e Naive Bayes.</p>
      <button onClick={runModels} disabled={isModelRunning} className="run-model-button">
        {isModelRunning ? 'Processando...' : 'Rodar Classificador MLP'}
      </button>
      {modelResults && <ModelResultCard results={modelResults} />}
    </section>
  );
};

export default ModelLabPage;