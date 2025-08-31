import React from 'react';
import './ModelResultCard.css';

const ModelResultCard = ({ results }) => {
  if (!results) return null;
  const { tn, fp, fn, tp } = results.confusion_matrix;
  
  return (
    <div className="model-card">
      <h3>{results.model}</h3>
      <div className="accuracy-display">
        <p>Acurácia no Conjunto de Teste</p>
        <span>{results.accuracy}</span>
      </div>
      <h4>Matriz de Confusão</h4>
      <table className="confusion-matrix">
        <tbody>
          <tr>
            <th></th>
            <th className="axis-label">Previsto: Derrota</th>
            <th className="axis-label">Previsto: Vitória</th>
          </tr>
          <tr>
            <th className="axis-label">Real: Derrota</th>
            <td className="tn">{tn}</td>
            <td className="fp">{fp}</td>
          </tr>
          <tr>
            <th className="axis-label">Real: Vitória</th>
            <td className="fn">{fn}</td>
            <td className="tp">{tp}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default ModelResultCard;