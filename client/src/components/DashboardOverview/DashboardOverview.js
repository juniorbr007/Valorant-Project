import React, { useState } from 'react';
import './DashboardOverview.css';
import { mockMatches } from '../../shared/mockMatchData';

// Importando todos os componentes que esta página utiliza
import MatchCard from '../MatchCard/MatchCard';
import StatWidget from '../StatWidget/StatWidget';

// Importando os ícones para os widgets
import { RiTrophyLine, RiSwordLine, RiFocus3Line, RiFlashlightLine, RiHeadphoneLine } from 'react-icons/ri';

const DashboardOverview = () => {
  // --- LÓGICA DE PAGINAÇÃO ---
  const [currentPage, setCurrentPage] = useState(1);
  const matchesPerPage = 10;
  const indexOfLastMatch = currentPage * matchesPerPage;
  const indexOfFirstMatch = indexOfLastMatch - matchesPerPage;
  const currentMatches = mockMatches.slice(indexOfFirstMatch, indexOfLastMatch);
  const pageNumbers = [];
  for (let i = 1; i <= Math.ceil(mockMatches.length / matchesPerPage); i++) {
    pageNumbers.push(i);
  }
  
  // --- LÓGICA DE DETECÇÃO DE ANOMALIAS ---
  const allScores = mockMatches.map(match => match.playerStats.score);
  const meanAcs = allScores.reduce((sum, score) => sum + score, 0) / allScores.length;
  const stdDev = Math.sqrt(
    allScores.map(score => Math.pow(score - meanAcs, 2)).reduce((sum, sq) => sum + sq, 0) / allScores.length
  );
  const threshold = 1.5 * stdDev;
  const analyzeMatchAnomaly = (matchScore) => {
    if (matchScore > meanAcs + threshold) {
      return { status: 'Positiva', deviation: ((matchScore / meanAcs - 1) * 100).toFixed(0) };
    }
    if (matchScore < meanAcs - threshold) {
      return { status: 'Negativa', deviation: ((1 - matchScore / meanAcs) * 100).toFixed(0) };
    }
    return { status: 'Normal', deviation: 0 };
  };

  // --- LÓGICA DE CÁLCULO DAS ESTATÍSTICAS GERAIS ---
  const totalMatches = mockMatches.length;
  const victories = mockMatches.filter(match => match.result === 'Vitória').length;
  const winRate = totalMatches > 0 ? ((victories / totalMatches) * 100).toFixed(0) : 0;
  const totalKills = mockMatches.reduce((sum, match) => sum + match.playerStats.kills, 0);
  const totalDeaths = mockMatches.reduce((sum, match) => sum + match.playerStats.deaths, 0);
  const totalAssists = mockMatches.reduce((sum, match) => sum + match.playerStats.assists, 0);
  const averageKDA = totalDeaths > 0 ? ((totalKills + totalAssists) / totalDeaths).toFixed(2) : (totalKills + totalAssists);
  const totalAcs = mockMatches.reduce((sum, match) => sum + match.playerStats.score, 0);
  const averageAcs = totalMatches > 0 ? (totalAcs / totalMatches).toFixed(0) : 0;
  const totalHs = mockMatches.reduce((sum, match) => sum + match.playerStats.headshotPercentage, 0);
  const averageHs = totalMatches > 0 ? (totalHs / totalMatches).toFixed(1) : 0;

  return (
    <div className="dashboard-overview-container">
      <section className="stats-grid">
        <StatWidget icon={<RiTrophyLine />} title="Taxa de Vitórias" value={`${winRate}%`} />
        <StatWidget icon={<RiSwordLine />} title="KDA Médio" value={averageKDA} />
        <StatWidget icon={<RiFlashlightLine />} title="ACS Médio" value={averageAcs} />
        <StatWidget icon={<RiHeadphoneLine />} title="Headshot %" value={`${averageHs}%`} />
        <StatWidget icon={<RiFocus3Line />} title="Partidas Analisadas" value={totalMatches} />
      </section>

      <main>
        <h2>Histórico de Partidas Recentes</h2>
        
        {currentMatches.map(match => {
          const anomalyInfo = analyzeMatchAnomaly(match.playerStats.score);
          return (
            <MatchCard 
              key={match.matchId} 
              match={match} 
              anomalyInfo={anomalyInfo}
            />
          );
        })}
        
        <nav className="pagination-nav">
          <ul className="pagination-list">
            {pageNumbers.map(number => (
              <li key={number} className="page-item">
                <button
                  onClick={() => setCurrentPage(number)}
                  className={`page-link ${currentPage === number ? 'active' : ''}`}
                >
                  {number}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </main>
    </div>
  );
};

export default DashboardOverview;