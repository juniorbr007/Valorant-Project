import React, { useState, useEffect } from 'react';
import './DashboardOverview.css';
import MatchCard from '../../MatchCard/MatchCard';
import StatWidget from '../../StatWidget/StatWidget';
import { RiTrophyLine, RiSwordLine, RiFocus3Line, RiFlashlightLine, RiHeadphoneLine } from 'react-icons/ri';

const DashboardOverview = () => {
  const [matches, setMatches] = useState([]);
  // NOVO ESTADO: para armazenar os rótulos do clustering
  const [classifications, setClassifications] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const matchesPerPage = 10;

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Busca as partidas
        const matchesResponse = await fetch(`${process.env.REACT_APP_API_URL}/api/matches`);
        const matchesData = await matchesResponse.json();
        setMatches(matchesData);

        // Se houver partidas, busca os resultados do clustering
        if (matchesData.length > 0) {
          const statsForClustering = matchesData.map(match => ({ ...match.playerStats, id: match.id }));
          const clusteringResponse = await fetch(`${process.env.REACT_APP_API_URL}/api/run-clustering`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(statsForClustering),
          });
          const clusteringData = await clusteringResponse.json();
          
          // Transforma o array de classificações em um objeto para busca rápida (ex: { 'match-1': 'Agressivo' })
          const classificationsMap = clusteringData.matchClassifications.reduce((acc, item) => {
            acc[item.id] = item.archetype;
            return acc;
          }, {});
          setClassifications(classificationsMap);
        }
      } catch (err) {
        console.error("Falha ao buscar dados do dashboard:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  if (isLoading) { return <div className="loading-message">Carregando dados do dashboard...</div>; }
  
  // (Toda a lógica de cálculo de stats, anomalias e paginação continua a mesma)
  // ...
  const totalMatches = matches.length;
  const victories = matches.filter(match => match.result === 'Vitória').length;
  const winRate = totalMatches > 0 ? ((victories / totalMatches) * 100).toFixed(0) : 0;
  const totalKills = matches.reduce((sum, match) => sum + match.playerStats.kills, 0);
  const totalDeaths = matches.reduce((sum, match) => sum + match.playerStats.deaths, 0);
  const totalAssists = matches.reduce((sum, match) => sum + match.playerStats.assists, 0);
  const averageKDA = totalDeaths > 0 ? ((totalKills + totalAssists) / totalDeaths).toFixed(2) : (totalKills + totalAssists);
  const totalAcs = matches.reduce((sum, match) => sum + match.playerStats.score, 0);
  const averageAcs = totalMatches > 0 ? (totalAcs / totalMatches).toFixed(0) : 0;
  const totalHs = matches.reduce((sum, match) => sum + match.playerStats.headshotPercentage, 0);
  const averageHs = totalMatches > 0 ? (totalHs / totalMatches).toFixed(1) : 0;
  const allScores = matches.map(match => match.playerStats.score);
  const meanAcsForAnomaly = averageAcs; 
  const stdDev = Math.sqrt(allScores.map(score => Math.pow(score - meanAcsForAnomaly, 2)).reduce((sum, sq) => sum + sq, 0) / allScores.length);
  const threshold = 1.5 * stdDev;
  const analyzeMatchAnomaly = (matchScore) => {
    if (matchScore > meanAcsForAnomaly + threshold) return { status: 'Positiva' };
    if (matchScore < meanAcsForAnomaly - threshold) return { status: 'Negativa' };
    return { status: 'Normal' };
  };
  const indexOfLastMatch = currentPage * matchesPerPage;
  const indexOfFirstMatch = indexOfLastMatch - matchesPerPage;
  const currentMatches = matches.slice(indexOfFirstMatch, indexOfLastMatch);
  const pageNumbers = [];
  for (let i = 1; i <= Math.ceil(matches.length / matchesPerPage); i++) {
    pageNumbers.push(i);
  }

  return (
    <div className="dashboard-overview-container">
      <section className="stats-grid">
        {/* Widgets */}
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
          // Busca o arquétipo desta partida específica
          const archetype = classifications[match.id] || '...';
          return (
            <MatchCard 
              key={match.id}
              match={match} 
              anomalyInfo={anomalyInfo}
              archetype={archetype} // Passa o rótulo como prop
            />
          );
        })}
        <nav className="pagination-nav">{/* Paginação */}</nav>
      </main>
    </div>
  );
};
export default DashboardOverview;