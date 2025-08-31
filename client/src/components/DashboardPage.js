import React from 'react';
import './DashboardPage.css';
import { mockMatches } from '../data/mockMatchData'; // 1. Importa os dados falsos
import MatchCard from './MatchCard'; // 2. Importa o nosso novo componente

const DashboardPage = ({ handleLogout }) => {
  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Histórico de Partidas</h1>
        <button className="logout-button" onClick={handleLogout}>
          Sair
        </button>
      </header>
      <main>
        {/* 3. Usa o método .map() para criar um MatchCard para cada item no nosso array de dados */}
        {mockMatches.map(match => (
          <MatchCard key={match.matchId} match={match} />
        ))}
      </main>
    </div>
  );
};

export default DashboardPage;