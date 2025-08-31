import React from 'react';
import './MatchCard.css';

// O componente recebe os dados de uma partida como "props"
const MatchCard = ({ match }) => {
  // Determina a classe CSS com base no resultado da partida
  const cardClass = match.result === 'Vitória' ? 'match-card victory' : 'match-card defeat';

  return (
    <div className={cardClass}>
      <div className="match-info">
        <h3>{match.map}</h3>
        <p>{match.agent}</p>
      </div>
      <div className="match-kda">
        <span>{`${match.kills} / ${match.deaths} / ${match.assists}`}</span>
      </div>
      <div className="match-score">
        <strong>{match.score}</strong>
      </div>
    </div>
  );
};

export default MatchCard;