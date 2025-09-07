import React from 'react';
import './ModelResultCard.css';

const ModelResultCard = ({ results }) => {
  // Verificação de segurança para garantir que os dados existem
  if (!results) {
    return <div className="model-result-card skeleton">Carregando...</div>;
  }

  // Função para formatar os números como porcentagem
  const formatAsPercent = (value) => {
    // Se o valor não for um número (ex: undefined), retorna 'N/A'
    if (typeof value !== 'number') return 'N/A';
    // Multiplica por 100 e fixa em 2 casas decimais
    return `${(value * 100).toFixed(2)}%`;
  };

  return (
    <div className="model-result-card">
      {/* --- AJUSTE AQUI --- */}
      {/* Usamos 'results.model_name' para pegar o nome do modelo */}
      <h3 className="model-name">{results.model_name}</h3>
      
      <ul className="metrics-list">
        <li>
          <span className="metric-label">Acurácia</span>
          {/* --- AJUSTE AQUI --- */}
          {/* Usamos 'results.accuracy' para o valor e formatamos */}
          <span className="metric-value">{formatAsPercent(results.accuracy)}</span>
        </li>
        <li>
          <span className="metric-label">Precisão</span>
          {/* --- AJUSTE AQUI --- */}
          <span className="metric-value">{formatAsPercent(results.precision)}</span>
        </li>
        <li>
          <span className="metric-label">Recall</span>
          {/* --- AJUSTE AQUI --- */}
          <span className="metric-value">{formatAsPercent(results.recall)}</span>
        </li>
        <li>
          <span className="metric-label">F1-Score</span>
          {/* --- AJUSTE AQUI --- */}
          <span className="metric-value">{formatAsPercent(results.f1_score)}</span>
        </li>
      </ul>
    </div>
  );
};

export default ModelResultCard;