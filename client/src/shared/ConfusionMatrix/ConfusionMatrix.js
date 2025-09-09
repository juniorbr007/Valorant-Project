import React from 'react';
import './ConfusionMatrix.css';

const ConfusionMatrix = ({ matrix, modelName }) => {
  // matrix deve ser um array 2x2: [[TN, FP], [FN, TP]]
  if (!matrix || matrix.length !== 2 || matrix.flat().length !== 4) {
    return <p>Dados da matriz de confusão inválidos.</p>;
  }

  const [tn, fp, fn, tp] = matrix.flat();

  return (
    <div className="confusion-matrix-container">
      <h4>Matriz de Confusão: {modelName}</h4>
      <table>
        <thead>
          <tr>
            <th colSpan="2"></th>
            <th colSpan="2" className="header-pred">Predição do Modelo</th>
          </tr>
          <tr>
            <th colSpan="2"></th>
            <th className="header-val">Derrota</th>
            <th className="header-val">Vitória</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th rowSpan="2" className="vertical-header"><span>Valor Real</span></th>
            <td className="header-cell">Derrota</td>
            <td className="cell correct-cell" title="Verdadeiro Negativo (Acertou Derrota)">{tn}</td>
            <td className="cell error-cell" title="Falso Positivo (Errou, era Derrota mas previu Vitória)">{fp}</td>
          </tr>
          <tr>
            <td className="header-cell">Vitória</td>
            <td className="cell error-cell" title="Falso Negativo (Errou, era Vitória mas previu Derrota)">{fn}</td>
            <td className="cell correct-cell" title="Verdadeiro Positivo (Acertou Vitória)">{tp}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default ConfusionMatrix;