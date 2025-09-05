import React, { useState, useEffect, useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer as RechartsResponsiveContainer, Cell,
  PieChart, Pie, Legend,
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';

// --- Componentes de Gráficos (Integrados para evitar erros de importação) ---

const PlayerACSchart = ({ matchData }) => {
  const chartData = useMemo(() => {
    const data = matchData.players.map(player => ({
      name: player.gameName,
      ACS: player.stats.score,
      fill: player.teamId === 'Blue' ? '#1d4ed8' : '#b91c1c',
    }));
    data.sort((a, b) => b.ACS - a.ACS);
    return data;
  }, [matchData]);

  const CustomTooltipACS = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="acs-custom-tooltip">
          <p className="label">{label}</p>
          <p className="intro">ACS: <strong>{payload[0].value}</strong></p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="acs-chart-container">
      <h3>Placar de Combate (ACS) da Partida</h3>
      <RechartsResponsiveContainer width="100%" height={400}>
        <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 30, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#475569" horizontal={false} />
          <XAxis type="number" stroke="#94a3b8" />
          <YAxis type="category" dataKey="name" stroke="#94a3b8" width={100} tick={{ fontSize: 12 }} />
          <Tooltip content={<CustomTooltipACS />} cursor={{ fill: 'rgba(0, 255, 255, 0.05)' }}/>
          <Bar dataKey="ACS" name="Pontuação de Combate" barSize={20}>
            {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.fill} />)}
          </Bar>
        </BarChart>
      </RechartsResponsiveContainer>
    </div>
  );
};

const DamagePieChart = ({ matchData, teamId }) => {
  const chartData = useMemo(() => {
    const teamPlayers = matchData.players.filter(p => p.teamId === teamId);
    return teamPlayers.map(player => ({
      name: player.gameName,
      value: player.stats.damage[0]?.damage || 0,
    }));
  }, [matchData, teamId]);
  
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF'];

  return (
    <div className="pie-chart-container">
      <h3>Contribuição de Dano - Time {teamId}</h3>
      <RechartsResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie data={chartData} cx="50%" cy="50%" labelLine={false} outerRadius={110} fill="#8884d8" dataKey="value" nameKey="name" label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}>
            {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
          </Pie>
          <Tooltip formatter={(value) => `${value} de dano`} />
          <Legend />
        </PieChart>
      </RechartsResponsiveContainer>
    </div>
  );
};

const PlayerRadarChart = ({ matchData }) => {
  const [selectedPlayerPuuid, setSelectedPlayerPuuid] = useState(matchData.players[0].puuid);

  const selectedPlayerData = useMemo(() => {
    const player = matchData.players.find(p => p.puuid === selectedPlayerPuuid);
    if (!player) return [];
    const data = [
      { subject: 'Abates', value: player.stats.kills, fullMark: 30 },
      { subject: 'Assist.', value: player.stats.assists, fullMark: 20 },
      { subject: 'Pontuação', value: player.stats.score, fullMark: 8000 },
      { subject: 'Dano', value: (player.stats.damage[0]?.damage || 0) / 100, fullMark: 60 },
    ];
    return data;
  }, [selectedPlayerPuuid, matchData]);
  
  const handlePlayerChange = (event) => setSelectedPlayerPuuid(event.target.value);
  const selectedPlayerName = matchData.players.find(p => p.puuid === selectedPlayerPuuid)?.gameName;

  return (
    <div className="radar-chart-container">
      <div className="radar-header">
        <h3>Perfil de Desempenho do Jogador</h3>
        <select onChange={handlePlayerChange} value={selectedPlayerPuuid} className="player-select">
          {matchData.players.map(player => <option key={player.puuid} value={player.puuid}>{player.gameName}</option>)}
        </select>
      </div>
      <RechartsResponsiveContainer width="100%" height={300}>
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={selectedPlayerData}>
          <PolarGrid stroke="#475569" />
          <PolarAngleAxis dataKey="subject" stroke="#cbd5e1" />
          <PolarRadiusAxis angle={30} domain={[0, 'dataMax + 5']} tick={false} axisLine={false} />
          <Radar name={selectedPlayerName} dataKey="value" stroke="#00ffff" fill="#00ffff" fillOpacity={0.6} />
          <Legend wrapperStyle={{ color: '#cbd5e1' }} />
        </RadarChart>
      </RechartsResponsiveContainer>
    </div>
  );
};


// --- Componentes da Página (Integrados) ---
const TrophyIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24"><path d="M17 4V2H7V4H2V11C2 12.1046 2.89543 13 4 13H5.0625C5.47913 15.3973 7.51041 17.2755 10 17.75V20H8V22H16V20H14V17.75C16.4896 17.2755 18.5209 15.3973 18.9375 13H20C21.1046 13 22 12.1046 22 11V4H17ZM4 6H20V11H4V6Z"></path></svg> );
const MapIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24"><path d="M2 5L9.73333 2L16.2667 4L22 2V19L14.2667 22L7.73333 20L2 22V5ZM14.2667 6.22361L9.73333 4.3118V19.6882L14.2667 20.3764V6.22361Z"></path></svg> );
const TimeIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24"><path d="M12 2C17.52 2 22 6.48 22 12C22 17.52 17.52 22 12 22C6.48 22 2 17.52 2 12C2 6.48 6.48 2 12 2ZM12 4C7.58 4 4 7.58 4 12C4 16.42 7.58 20 12 20C16.42 20 20 16.42 20 12C20 7.58 16.42 4 12 4ZM12.5 7V12.25L16.5 14.33L15.75 15.42L11 13V7H12.5Z"></path></svg> );
const TeamIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24"><path d="M14 14.252V16.248L15.248 15L14 14.252ZM12.5 13.5L11 12.752V10.752L12.5 10V13.5ZM9.99999 14.252L8.75195 15L9.99999 15.748V14.252ZM12.5 2C18.02 2 22.5 6.48 22.5 12C22.5 17.52 18.02 22 12.5 22C6.98 22 2.5 17.52 2.5 12C2.5 6.48 6.98 2 12.5 2ZM12.5 4C8.08 4 4.5 7.58 4.5 12C4.5 16.42 8.08 20 12.5 20C16.92 20 20.5 16.42 20.5 12C20.5 7.58 16.92 4 12.5 4ZM12.5 9C13.88 9 15 7.88 15 6.5C15 5.12 13.88 4 12.5 4C11.12 4 10 5.12 10 6.5C10 7.88 11.12 9 12.5 9ZM8.5 10C9.33 10 10 9.33 10 8.5C10 7.67 9.33 7 8.5 7C7.67 7 7 7.67 7 8.5C7 9.33 7.67 10 8.5 10ZM16.5 10C17.33 10 18 9.33 18 8.5C18 7.67 17.33 7 16.5 7C15.67 7 15 7.67 15 8.5C15 9.33 15.67 10 16.5 10ZM12.5 14.5C14.1569 14.5 15.5 15.8431 15.5 17.5C15.5 19.1569 14.1569 20.5 12.5 20.5C10.8431 20.5 9.5 19.1569 9.5 17.5C9.5 15.8431 10.8431 14.5 12.5 14.5Z"></path></svg> );

const StatWidget = ({ icon, title, value }) => ( <div className="stat-widget"> <div className="widget-icon">{icon}</div> <div className="widget-content"> <span className="widget-title">{title}</span> <span className="widget-value">{value}</span> </div> </div> );
const MatchHistoryView = ({ matches, onSelect }) => ( <main> <h2>Histórico de Partidas</h2> <div className="match-history-list"> {matches.map(match => ( <div key={match.id} className="history-match-card" onClick={() => onSelect(match.id)}> <div className={`result-indicator ${match.result.toLowerCase()}`}></div> <div className="history-card-map">{match.map}</div> <div className="history-card-agent">{match.agent}</div> <div className="history-card-result">{match.result}</div> <div className="history-card-score">{match.score}</div> <div className="history-card-cta">Ver Detalhes →</div> </div> ))} </div> </main> );

const MatchDetailView = ({ matchData, onBack }) => {
  const [activeTab, setActiveTab] = useState('placar');
  const getMapName = (mapId) => { if (!mapId) return 'Desconhecido'; const parts = mapId.split('/'); return parts[parts.length - 1]; };
  const formatDuration = (millis) => { const minutes = Math.floor(millis / 60000); const seconds = ((millis % 60000) / 1000).toFixed(0); return `${minutes}m ${seconds}s`; };
  const calculateKDA = (stats) => { if (stats.deaths === 0) return (stats.kills + stats.assists).toFixed(2); return ((stats.kills + stats.assists) / stats.deaths).toFixed(2); };
  const winningTeam = matchData.teams.find(team => team.won);
  const losingTeam = matchData.teams.find(team => !team.won);
  const finalScore = winningTeam && losingTeam ? `${winningTeam.roundsWon} - ${losingTeam.roundsWon}` : 'N/A';
  const blueTeamPlayers = matchData.players.filter(p => p.teamId === 'Blue');
  const redTeamPlayers = matchData.players.filter(p => p.teamId === 'Red');

  return (
    <>
      <button onClick={onBack} className="back-button">← Voltar para o Histórico</button>
      <section className="stats-grid">
        <StatWidget icon={<MapIcon />} title="Mapa" value={getMapName(matchData.matchInfo.mapId)} />
        <StatWidget icon={<TrophyIcon />} title="Resultado" value={winningTeam ? `Vitória ${winningTeam.teamId}` : 'Empate'} />
        <StatWidget icon={<TeamIcon />} title="Placar Final" value={finalScore} />
        <StatWidget icon={<TimeIcon />} title="Duração" value={formatDuration(matchData.matchInfo.gameLengthMillis)} />
      </section>
      
      <nav className="match-detail-nav">
        <button className={`nav-tab-button ${activeTab === 'placar' ? 'active' : ''}`} onClick={() => setActiveTab('placar')}>Placar</button>
        <button className={`nav-tab-button ${activeTab === 'graficos' ? 'active' : ''}`} onClick={() => setActiveTab('graficos')}>Gráficos de Performance</button>
      </nav>

      <main>
        {activeTab === 'placar' && (
          <div className="scoreboard">
            <h2>Placar da Partida</h2>
            <table className="scoreboard-table blue-team"> <thead> <tr><th colSpan="7">Time Azul - {matchData.teams.find(t=>t.teamId === 'Blue')?.roundsWon || 0} Rodadas</th></tr> <tr><th>Jogador</th><th>Agente</th><th>Pontuação</th><th>Abates</th><th>Mortes</th><th>Assist.</th><th>KDA</th></tr> </thead> <tbody> {blueTeamPlayers.map(player => ( <tr key={player.puuid}> <td>{player.gameName}#{player.tagLine}</td><td>{player.characterId}</td><td>{player.stats.score}</td><td>{player.stats.kills}</td><td>{player.stats.deaths}</td><td>{player.stats.assists}</td><td>{calculateKDA(player.stats)}</td> </tr> ))} </tbody> </table>
            <table className="scoreboard-table red-team"> <thead> <tr><th colSpan="7">Time Vermelho - {matchData.teams.find(t=>t.teamId === 'Red')?.roundsWon || 0} Rodadas</th></tr> <tr><th>Jogador</th><th>Agente</th><th>Pontuação</th><th>Abates</th><th>Mortes</th><th>Assist.</th><th>KDA</th></tr> </thead> <tbody> {redTeamPlayers.map(player => ( <tr key={player.puuid}> <td>{player.gameName}#{player.tagLine}</td><td>{player.characterId}</td><td>{player.stats.score}</td><td>{player.stats.kills}</td><td>{player.stats.deaths}</td><td>{player.stats.assists}</td><td>{calculateKDA(player.stats)}</td> </tr> ))} </tbody> </table>
          </div>
        )}
        {activeTab === 'graficos' && (
          <div className="graphs-container">
            <PlayerACSchart matchData={matchData} />
            <DamagePieChart matchData={matchData} teamId="Blue" />
            <DamagePieChart matchData={matchData} teamId="Red" />
            <PlayerRadarChart matchData={matchData} />
          </div>
        )}
      </main>
    </>
  );
};

// --- COMPONENTE PRINCIPAL ---
const DashboardOverview = () => {
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [matchHistory, setMatchHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  
  useEffect(() => { 
    const fetchHistory = async () => { 
      setIsLoading(true); 
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/match-history`);
        if (!response.ok) {
          throw new Error('Falha ao buscar o histórico de partidas do servidor.');
        }
        const data = await response.json();
        setMatchHistory(data);
      } catch (err) {
        console.error("Erro no useEffect ao buscar histórico:", err);
      } finally {
        setIsLoading(false);
      }
    }; 
    fetchHistory(); 
  }, []);

  const handleMatchSelect = async (matchId) => {
    setIsDetailLoading(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/detailed-match/${matchId}`);
      if (!response.ok) {
        throw new Error(`Partida ${matchId} não encontrada no servidor (status: ${response.status}).`);
      }
      const data = await response.json();
      setSelectedMatch(data);
    } catch (err) {
      console.error("Falha ao buscar detalhes da partida:", err);
    } finally {
      setIsDetailLoading(false);
    }
  };

  const handleGoBack = () => {
    setSelectedMatch(null);
  };

  return ( 
    <>
      <style>{`
        /* --- TEMA: CYPHER'S EDGE --- */
        .dashboard-overview-container { padding: 2rem; color: #e2e8f0; font-family: 'Inter', sans-serif; }
        .loading-message { text-align: center; padding: 4rem; font-size: 1.2rem; color: #00ffff; text-transform: uppercase; letter-spacing: 2px; }
        .back-button { background: rgba(0, 255, 255, 0.1); color: #00ffff; border: 1px solid #00ffff; padding: 0.75rem 1.5rem; border-radius: 4px; font-size: 1rem; font-weight: 500; cursor: pointer; margin-bottom: 2rem; transition: all 0.2s ease; backdrop-filter: blur(5px); }
        .back-button:hover { background: rgba(0, 255, 255, 0.2); box-shadow: 0 0 15px rgba(0, 255, 255, 0.5); }
        main h2 { font-size: 1.8rem; margin-bottom: 1.5rem; color: #f1f5f9; border-bottom: 1px solid #00ffff; padding-bottom: 10px; text-shadow: 0 0 8px rgba(0, 255, 255, 0.7); }
        .match-history-list { display: flex; flex-direction: column; gap: 1rem; }
        .history-match-card { display: grid; grid-template-columns: 5px 1fr 1fr 1fr 1fr auto; align-items: center; background: linear-gradient(to right, rgba(15, 25, 35, 0.8), rgba(30, 41, 59, 0.8)); padding: 1.25rem; border: 1px solid #475569; cursor: pointer; transition: all 0.2s ease; clip-path: polygon(0 0, calc(100% - 15px) 0, 100% 15px, 100% 100%, 0 100%); }
        .history-match-card:hover { border-color: #00ffff; transform: translateY(-3px); box-shadow: 0 0 20px rgba(0, 255, 255, 0.2); }
        .result-indicator { width: 5px; height: 100%; margin-left: -1.25rem; box-shadow: 0 0 10px; }
        .result-indicator.vitória { background-color: #22c55e; box-shadow: 0 0 10px #22c55e; }
        .result-indicator.derrota { background-color: #ef4444; box-shadow: 0 0 10px #ef4444; }
        .history-card-map, .history-card-agent, .history-card-result, .history-card-score { font-size: 1rem; color: #cbd5e1; }
        .history-card-cta { font-weight: 500; color: #00ffff; justify-self: end; }
        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem; margin-bottom: 3rem; }
        .stat-widget { background: rgba(30, 41, 59, 0.7); backdrop-filter: blur(10px); border-radius: 4px; padding: 1.5rem; display: flex; align-items: center; gap: 1rem; border: 1px solid #475569; transition: border-color 0.2s ease; }
        .stat-widget:hover { border-color: #00ffff; }
        .widget-icon { color: #00ffff; }
        .widget-content { display: flex; flex-direction: column; }
        .widget-title { font-size: 0.9rem; color: #94a3b8; text-transform: uppercase; }
        .widget-value { font-size: 1.5rem; font-weight: 600; color: #f1f5f9; }
        .scoreboard { display: flex; flex-direction: column; gap: 2rem; }
        .scoreboard-table { width: 100%; border-collapse: collapse; background: rgba(15, 25, 35, 0.8); backdrop-filter: blur(5px); border: 1px solid #475569; border-radius: 4px; overflow: hidden; }
        .scoreboard-table th, .scoreboard-table td { padding: 1rem; text-align: left; }
        .scoreboard-table thead tr:first-child th { font-size: 1.2rem; color: #f1f5f9; text-align: center; text-shadow: 0 0 5px #000; }
        .scoreboard-table thead tr:last-child th { background-color: rgba(71, 85, 105, 0.3); color: #cbd5e1; font-weight: 500; font-size: 0.8rem; text-transform: uppercase; }
        .scoreboard-table.blue-team thead tr:first-child { background: linear-gradient(90deg, transparent, rgba(29, 78, 216, 0.5), transparent); }
        .scoreboard-table.red-team thead tr:first-child { background: linear-gradient(90deg, transparent, rgba(185, 28, 28, 0.5), transparent); }
        .scoreboard-table tbody tr { border-bottom: 1px solid #475569; transition: background-color 0.2s ease; }
        .scoreboard-table tbody tr:last-child { border-bottom: none; }
        .scoreboard-table tbody tr:hover { background-color: rgba(0, 255, 255, 0.05); }
        .match-detail-nav { display: flex; gap: 1rem; margin-bottom: 2rem; border-bottom: 1px solid #475569; }
        .nav-tab-button { background: none; border: none; color: #94a3b8; padding: 1rem; font-size: 1rem; cursor: pointer; position: relative; transition: color 0.2s ease; }
        .nav-tab-button:hover { color: #f1f5f9; }
        .nav-tab-button.active { color: #00ffff; font-weight: 600; }
        .nav-tab-button.active::after { content: ''; position: absolute; bottom: -1px; left: 0; width: 100%; height: 2px; background-color: #00ffff; box-shadow: 0 0 8px #00ffff; }
        .graphs-container { display: grid; grid-template-columns: 1fr; gap: 2rem; }
        @media (min-width: 1024px) { .graphs-container { grid-template-columns: repeat(2, 1fr); } .graphs-container > *:first-child, .graphs-container > *:last-child { grid-column: 1 / -1; } }
        /* Estilos específicos para os gráficos */
        .acs-chart-container, .pie-chart-container, .radar-chart-container { background-color: rgba(30, 41, 59, 0.5); padding: 2rem; border: 1px solid #475569; border-radius: 8px; }
        .acs-chart-container h3, .pie-chart-container h3, .radar-header h3 { color: #f1f5f9; text-align: center; margin-top: 0; margin-bottom: 2rem; font-size: 1.2rem; text-transform: uppercase; }
        .chart-wrapper { width: 100%; height: auto; }
        .acs-custom-tooltip { background-color: rgba(15, 25, 35, 0.9); border: 1px solid #00ffff; padding: 10px; border-radius: 4px; color: #e2e8f0; }
        .acs-custom-tooltip .label { font-weight: bold; color: #00ffff; }
        .recharts-legend-item-text { color: #cbd5e1 !important; }
        .recharts-pie-label-text { fill: #f1f5f9; font-size: 14px; }
        .radar-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
        .radar-header h3 { margin: 0; }
        .player-select { background-color: #1e293b; color: #f1f5f9; border: 1px solid #475569; border-radius: 4px; padding: 0.5rem; font-family: 'Inter', sans-serif; }
      `}</style>
      <div className="dashboard-overview-container"> 
        {isLoading && <div className="loading-message">Carregando histórico...</div>} 
        {!isLoading && ( 
          selectedMatch ? ( 
            isDetailLoading ? <div className="loading-message">Carregando detalhes da partida...</div> : <MatchDetailView matchData={selectedMatch} onBack={handleGoBack} /> 
          ) : ( 
            <MatchHistoryView matches={matchHistory} onSelect={handleMatchSelect} /> 
          ) 
        )} 
      </div> 
    </>
  );
};

export default DashboardOverview;

