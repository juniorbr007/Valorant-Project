import React from 'react';
import './MatchCard.css';
import { RiStarFill, RiErrorWarningLine } from 'react-icons/ri';

// A versão segura que não quebra se 'anomalyInfo' não for passado
const MatchCard = ({ match, anomalyInfo = { status: 'Normal' } }) => {
  
  let cardClass = match.result === 'Vitória' ? 'match-card victory' : 'match-card defeat';
  if (anomalyInfo.status !== 'Normal') {
    cardClass += ' anomaly';
  }

  const AnomalyBadge = () => {
    if (anomalyInfo.status === 'Positiva') {
      return (
        <div className="anomaly-badge positive" title={`Performance ${anomalyInfo.deviation}% acima da média!`}>
          <RiStarFill />
        </div>
      );
    }
    if (anomalyInfo.status === 'Negativa') {
      return (
        <div className="anomaly-badge negative" title={`Performance ${anomalyInfo.deviation}% abaixo da média!`}>
          <RiErrorWarningLine />
        </div>
      );
    }
    return null;
  };

  const { agent, kills, deaths, assists } = match.playerStats;
  const score = `${match.roundsWon} - ${match.roundsLost}`;

  return (
    <div className={cardClass}>
      <AnomalyBadge />
      <div className="match-info">
        <h3>{match.map}</h3>
        <p>{agent}</p>
      </div>
      <div className="match-kda">
        <span>{`${kills} / ${deaths} / ${assists}`}</span>
      </div>
      <div className="match-score">
        <strong>{score}</strong>
      </div>
    </div>
  );
};

export default MatchCard;