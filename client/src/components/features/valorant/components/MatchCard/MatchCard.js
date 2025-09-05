import React from 'react';
import './MatchCard.css';
import { RiArrowUpCircleFill, RiArrowDownCircleFill } from 'react-icons/ri';

const MatchCard = ({ match, anomalyInfo, archetype }) => {
  const { result, map } = match;
  const { agent, score, kills, deaths, assists } = match.playerStats;

  let cardClass = result === 'Vitória' ? 'win' : 'loss';
  if (anomalyInfo && anomalyInfo.status !== 'Normal') {
    cardClass += ' anomaly'; 
  }

  const AnomalyBadge = () => {
    if (!anomalyInfo) return null;

    if (anomalyInfo.status === 'Positiva') {
      return <RiArrowUpCircleFill className="anomaly-badge positive" title="Performance Excepcional" />;
    }
    if (anomalyInfo.status === 'Negativa') {
      return <RiArrowDownCircleFill className="anomaly-badge negative" title="Performance Abaixo da Média" />;
    }
    return null;
  };

  return (
    <div className={`match-card-container ${cardClass}`}>
      <AnomalyBadge />

      <div className="match-info">
        <span className="map">{map}</span>
        <span className="agent">{agent}</span>
        
        {/* --- ADIÇÃO DO RÓTULO DE CLUSTERING ABAIXO --- */}
        {archetype && <div className={`archetype-tag ${archetype.toLowerCase()}`}>{archetype}</div>}

      </div>
      <div className="match-stats">
        <div className="kda">
          <span className="stat-label">KDA</span>
          <span>{`${kills} / ${deaths} / ${assists}`}</span>
        </div>
        <div className="acs">
          <span className="stat-label">ACS</span>
          <span>{score}</span>
        </div>
      </div>
      <div className="match-outcome">
        <span>{result.toUpperCase()}</span>
      </div>
    </div>
  );
};

export default MatchCard;