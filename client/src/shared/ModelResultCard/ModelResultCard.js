import React from 'react';
import './ModelResultCard.css';

// Pequeno sub-componente para evitar repetição de código na tabela
const ReportRow = ({ label, data }) => {
  // Verificação para o caso de os dados ainda não terem chegado
  if (!data) return null;

  return (
    <tr>
      <td className="label-cell">{label}</td>
      <td>{(data.precision * 100).toFixed(1)}%</td>
      <td>{(data.recall * 100).toFixed(1)}%</td>
      <td>{(data['f1-score']).toFixed(2)}</td>
      <td>{data.support}</td>
    </tr>
  );
};


const ModelResultCard = ({ results }) => {
  if (!results) {
    return <div className="model-result-card skeleton">Carregando...</div>;
  }
  
  // Pegamos o relatório detalhado que veio do nosso script Python
  const report = results.classification_report;

  return (
    <div className="model-result-card detailed">
      <h3 className="model-name">{results.model_name}</h3>
      <div className="accuracy-box">
        Acurácia Geral: <span>{(results.accuracy * 100).toFixed(2)}%</span>
      </div>
      
      {report && (
        <table className="report-table">
          <thead>
            <tr>
              <th>Classe</th>
              <th>Precisão</th>
              <th>Recall</th>
              <th>F1-Score</th>
              <th>Amostras</th>
            </tr>
          </thead>
          <tbody>
            <ReportRow label="Derrota" data={report.loss} />
            <ReportRow label="Vitória" data={report.win} />
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ModelResultCard;