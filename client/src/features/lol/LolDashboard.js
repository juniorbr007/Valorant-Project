import React, { useState, useEffect } from 'react';
import MatchDetail from './components/MatchDetail/MatchDetail';
import LolModelLabPage from './pages/LolModelLabPage/LolModelLabPage';
import './LolDashboard.css';

const LolDashboard = () => {
  // --- ESTADOS ---
  const [activeTab, setActiveTab] = useState('playerSearch');
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
  const [saveAllStatus, setSaveAllStatus] = useState({ loading: false, message: '' });
  const [gameVersion, setGameVersion] = useState('14.5.1');

  // --- EFEITOS ---
  useEffect(() => {
    const fetchLatestVersion = async () => { /* ...código existente... */ };
    fetchLatestVersion();
  }, []);

  useEffect(() => {
    if (!playerData?.puuid) { setMatchHistory([]); return; }
    const fetchMatchHistory = async () => {
      setIsLoadingMatches(true); setError(''); setSaveAllStatus({ loading: false, message: '' });
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/lol/matches/${playerData.puuid}`);
        const data = await response.json();
        if (!response.ok) { throw new Error(data.message || 'Erro ao buscar o histórico.'); }
        setMatchHistory(data);
      } catch (err) { setError(err.message); } finally { setIsLoadingMatches(false); }
    };
    fetchMatchHistory();
  }, [playerData]);

  // --- FUNÇÕES HANDLER (COMPLETAS) ---
  const handleSearch = async (e) => {
    e.preventDefault(); // <-- A LINHA MÁGICA QUE FALTAVA!
    if (!riotId || !tagLine) { setError('Por favor, preencha o Riot ID e a Tag Line.'); return; }
    setIsLoadingPlayer(true); setError(''); setPlayerData(null); setSelectedMatchData(null);
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/lol/player/${riotId}/${tagLine}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Erro desconhecido.');
      setPlayerData(data);
    } catch (err) { setError(err.message); } finally { setIsLoadingPlayer(false); }
  };

  const handleMatchClick = async (matchId) => {
    setIsLoadingMatchDetails(true); setError(''); setSelectedMatchData(null);
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/lol/match/${matchId}`);
      const data = await response.json();
      if (!response.ok) { throw new Error(data.message || 'Erro ao buscar detalhes da partida.'); }
      setSelectedMatchData(data);
    } catch (err) { setError(err.message); } finally { setIsLoadingMatchDetails(false); }
  };
  
  const handleSaveAllMatches = async () => {
    if (matchHistory.length === 0) return;
    setSaveAllStatus({ loading: true, message: 'Salvando...' });
    try {
      const detailedMatchesPromises = matchHistory.map(match =>
        fetch(`${process.env.REACT_APP_API_URL}/api/lol/match/${match.matchId}`).then(res => res.json())
      );
      const detailedMatches = await Promise.all(detailedMatchesPromises);
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/lol/save-matches`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(detailedMatches),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Erro no servidor');
      setSaveAllStatus({ loading: false, message: `${result.inserted || 0} novas salvas!` });
    } catch (error) {
      console.error("Falha ao salvar todas as partidas:", error);
      setSaveAllStatus({ loading: false, message: 'Erro!' });
    }
  };
  
  const renderTabContent = () => {
    switch (activeTab) {
      case 'playerSearch':
        return (
          <>
            <div className="search-container">
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
                  <div className="results-header">
                    <h3>Últimas Partidas</h3>
                    <button className="save-all-button" onClick={handleSaveAllMatches} disabled={saveAllStatus.loading}>
                      {saveAllStatus.loading ? '...' : (saveAllStatus.message || 'Salvar as 20')}
                    </button>
                  </div>
                  <ul>
                    {matchHistory.map((match) => (
                      <li key={match.matchId} onClick={() => handleMatchClick(match.matchId)} className={match.win ? 'win' : 'loss'}>
                        <img className="champion-icon-small" src={`https://ddragon.leagueoflegends.com/cdn/${gameVersion}/img/champion/${match.championName}.png`} alt={match.championName} title={match.championName} />
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
          </>
        );
      case 'modelLab':
        return <LolModelLabPage playerData={playerData}/>;
      default:
        return <h2>Selecione uma aba</h2>;
    }
  };

  return (
    <>
      <div className="lol-dashboard-container">
        <nav className="dashboard-nav">
          <button onClick={() => setActiveTab('playerSearch')} className={activeTab === 'playerSearch' ? 'active' : ''}>
            Análise de Partidas
          </button>
          <button onClick={() => setActiveTab('modelLab')} className={activeTab === 'modelLab' ? 'active' : ''}>
            Laboratório de Modelos
          </button>
        </nav>
        <div className="dashboard-content">
          {renderTabContent()}
        </div>
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