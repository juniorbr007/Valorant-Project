import React from 'react';
import './ModelResultCard.css';

// Um pequeno componente auxiliar para evitar repetição de código
const MetricDisplay = ({ name, mean, std }) => (
  <div className="metric-item">
    <span>{name}</span>
    <strong>{mean} <span className="std-dev">{std}</span></strong>
  </div>
);

const ModelResultCard = ({ results }) => {
  if (!results) return null;
  
  return (
    <div className="model-card">
      <h3>{results.model}</h3>
      
      {/* Acurácia continua em destaque */}
      <div className="accuracy-display">
        <p>Acurácia Média (Validação Cruzada)</p>
        <span>{results.mean_accuracy}</span>
      </div>

      {/* Seção com todas as métricas detalhadas */}
      <div className="detailed-metrics">
        <MetricDisplay 
          name="Precisão Média"
          mean={results.mean_precision}
          std={results.std_precision}
        />
        <MetricDisplay 
          name="Revocação Média"
          mean={results.mean_recall}
          std={results.std_recall}
        />
        <MetricDisplay 
          name="F1-Score Médio"
          mean={results.mean_f1}
          std={results.std_f1}
        />
      </div>
    </div>
  );
};

export default ModelResultCard;