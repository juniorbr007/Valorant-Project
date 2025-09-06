import React, { useState } from 'react';
import './PredictionSimulator.css';

// 1. Criamos um "dicionário" para os nomes das labels
const labelNames = {
  score: "Score",
  kills: "Kills",
  deaths: "Deaths",
  assists: "Assists",
  headshotPercentage: "Headshot %",
  firstKills: "First Kills",
};

const PredictionSimulator = () => {
  const [stats, setStats] = useState({
    score: '250',
    kills: '18',
    deaths: '12',
    assists: '5',
    headshotPercentage: '20',
    firstKills: '3',
  });
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setStats(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setResult(null);

    const numericStats = Object.fromEntries(
        Object.entries(stats).map(([key, value]) => [key, Number(value)])
    );
    
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(numericStats),
      });
      const data = await response.json();
      setResult(data);
    } catch (err) {
      console.error("Erro na predição:", err);
      setResult({ prediction: "Erro", confidence: "Falha na comunicação" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="simulator-container">
      <h3>Simulador de Partida</h3>
      <p>Insira suas estatísticas para obter uma previsão de resultado.</p>
      <form onSubmit={handleSubmit} className="simulator-form">
        <div className="form-grid">
          {Object.keys(stats).map(key => (
            <div className="input-group" key={key}>
              {/* 2. Usamos nosso dicionário para um nome mais limpo */}
              <label htmlFor={key}>{labelNames[key]}</label>
              <input
                type="number"
                name={key}
                id={key}
                value={stats[key]}
                onChange={handleChange}
                required
              />
            </div>
          ))}
        </div>
        <button type="submit" disabled={isLoading} className="predict-button">
          {isLoading ? 'Analisando...' : 'Prever Resultado'}
        </button>
      </form>

      {result && (
        <div className={`result-card ${result.prediction.toLowerCase()}`}>
          <h4>Previsão do Modelo</h4>
          <span className="prediction">{result.prediction}</span>
          <p>Confiança: <strong>{result.confidence}</strong></p>
        </div>
      )}
    </div>
  );
};

export default PredictionSimulator;