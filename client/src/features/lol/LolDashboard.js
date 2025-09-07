import React, { useState, useEffect } from 'react';
import MatchDetail from './components/MatchDetail/MatchDetail';
import './LolDashboard.css';

const LolDashboard = () => {
  // --- ESTADOS ---
  const [riotId, setRiotId] = useState('');
  const [tagLine, setTagLine] = useState('');
  const [playerData, setPlayerData] = useState(null);
  const [matchHistory, setMatchHistory] = useState([]);
  const [selectedMatchData, setSelectedMatchData] = useState(null);
  const [isLoadingPlayer, setIsLoadingPlayer] = useState(false);
  const [isLoadingMatches, setIsLoadingMatches] = useState(false);
  const [isLoadingMatchDetails, setIsLoadingMatchDetails] = useState(false);
  const [error, setError] = useState('');
  const [isPlayerJsonVisible, setPlayerJsonVisible] = useState(false);
  const [gameVersion, setGameVersion] = useState('14.5.1'); // Versão de fallback

  // --- EFEITOS ---
  
  // Busca a versão mais recente do Data Dragon para garantir ícones atualizados
  useEffect(() => {
    const fetchLatestVersion = async () => {
      try {
        const response = await fetch('https://ddragon.leagueoflegends.com/api/versions.json');
        const versions = await response.json();
        if (versions.length > 0) setGameVersion(versions[0]);
      } catch (error) { console.error("Falha ao buscar a versão do Data Dragon:", error); }
    };
    fetchLatestVersion();
  }, []);

  // Busca o histórico de partidas sempre que 'playerData' for atualizado
  useEffect(() => {
    if (!playerData?.puuid) { setMatchHistory([]); return; }
    const fetchMatchHistory = async () => {
      setIsLoadingMatches(true); setError('');
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/lol/matches/${playerData.puuid}`);
        const data = await response.json();
        if (!response.ok) { throw new Error(data.message || 'Erro ao buscar o histórico.'); }
        setMatchHistory(data);
      } catch (err) { setError(err.message); } finally { setIsLoadingMatches(false); }
    };
    fetchMatchHistory();
  }, [playerData]);

  // --- FUNÇÕES HANDLER ---

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!riotId || !tagLine) { setError('Por favor, preencha o Riot ID e a Tag Line.'); return; }
    setIsLoadingPlayer(true); setError(''); setPlayerData(null); setSelectedMatchData(null);
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/lol/player/${riotId}/${tagLine}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Erro desconhecido.');
      setPlayerData(data);
    } catch (err) { setError(err.message); } finally { setIsLoadingPlayer(false); }
  };

  // LÓGICA DA FUNÇÃO handleMatchClick PREENCHIDA
  const handleMatchClick = async (matchId) => {
    setIsLoadingMatchDetails(true);
    setError('');
    setSelectedMatchData(null);
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/lol/match/${matchId}`);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Erro ao buscar detalhes da partida.');
      }
      setSelectedMatchData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoadingMatchDetails(false);
    }
  };

  return (
    <>
      <div className="lol-dashboard-container">
        <div className="search-container">
          {/* JSX DO FORMULÁRIO DE BUSCA RESTAURADO */}
          <h2>Buscar Invocador</h2>
          <form onSubmit={handleSearch}>
            <div className="input-group">
              <input type="text" placeholder="Riot ID" value={riotId} onChange={(e) => setRiotId(e.target.value)} />
              <span>#</span>
              <input type="text" placeholder="Tag" value={tagLine} onChange={(e) => setTagLine(e.target.value)} className="tagline-input" />
            </div>
            <button type="submit" disabled={isLoadingPlayer}>
              {isLoadingPlayer ? 'Buscando...' : 'Buscar'}
            </button>
          </form>
        </div>

        {error && <p className="error-message">{error}</p>}

        <div className="player-data-container">
          {playerData && (
            <div className="results-container player-info">
              <div className="results-header">
                <h3>Dados da Conta</h3>
                <button className="dev-screen-button" onClick={() => setPlayerJsonVisible(true)} title="Exibir dados brutos (JSON)">&lt;/&gt;</button>
              </div>
              <pre>{JSON.stringify(playerData, null, 2)}</pre>
            </div>
          )}

          {isLoadingMatches && <div className="loading-message">Carregando histórico...</div>}

          {matchHistory.length > 0 && (
            <div className="results-container match-history">
              <h3>Últimas Partidas</h3>
              <ul>
                {matchHistory.map((match) => (
                  <li key={match.matchId} onClick={() => handleMatchClick(match.matchId)} className={match.win ? 'win' : 'loss'}>
                    <img 
                      className="champion-icon-small"
                      src={`https://ddragon.leagueoflegends.com/cdn/${gameVersion}/img/champion/${match.championName}.png`} 
                      alt={match.championName}
                      title={match.championName}
                    />
                    <div className="match-list-info">
                      <span className="game-mode">{match.gameMode}</span>
                      <span className="match-kda">{`${match.kills}/${match.deaths}/${match.assists}`}</span>
                    </div>
                    <span className="match-result">{match.win ? 'Vitória' : 'Derrota'}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {isLoadingMatchDetails && <div className="loading-message">Analisando detalhes da partida...</div>}
        
        {selectedMatchData && (
           <div className="results-container match-details">
             <MatchDetail matchData={selectedMatchData} playerPuuid={playerData?.puuid} />
           </div>
        )}
      </div>

      {isPlayerJsonVisible && (
        <div className="dev-screen-overlay" onClick={() => setPlayerJsonVisible(false)}>
          <div className="dev-screen-content" onClick={(e) => e.stopPropagation()}>
            <div className="dev-screen-header">
              <span>[DEV_MODE]: RAW PLAYER DATA</span>
              <button onClick={() => setPlayerJsonVisible(false)}>X</button>
            </div>
            <pre>{JSON.stringify(playerData, null, 2)}</pre>
          </div>
        </div>
      )}
    </>
  );
};

export default LolDashboard;