import React, { useState, useEffect } from 'react';
import './MatchDetail.css';

// Sub-componente para renderizar cada linha do placar
const PlayerRow = ({ participant, playerPuuid, gameVersion }) => {
  const championIconUrl = `https://ddragon.leagueoflegends.com/cdn/${gameVersion}/img/champion/${participant.championName}.png`;
  const getItemIconUrl = (itemId) => `https://ddragon.leagueoflegends.com/cdn/${gameVersion}/img/item/${itemId}.png`;
  
  const isMainPlayer = participant.puuid === playerPuuid;

  // Lógica para exibir o nome do invocador corretamente
  const summonerDisplay = (
    <div className="summoner-identity">
      <span className="summoner-name">{participant.riotIdName || participant.summonerName}</span>
      {participant.riotIdTagline && <span className="tag-line">#{participant.riotIdTagline}</span>}
    </div>
  );

  return (
    <div className={`player-row ${isMainPlayer ? 'main-player' : ''}`}>
      <div className="player-info">
        <img src={championIconUrl} alt={participant.championName} className="champion-icon" />
        {summonerDisplay}
      </div>
      <div className="player-kda">{`${participant.kills} / ${participant.deaths} / ${participant.assists}`}</div>
      <div className="player-items">
        {[0, 1, 2, 3, 4, 5, 6].map(index => ( // Itens 0-5 são o inventário, 6 é o trinket
          participant[`item${index}`]
            ? <img key={index} src={getItemIconUrl(participant[`item${index}`])} alt={`Item ${index}`} />
            : <div key={index} className="item-slot"></div>
        ))}
      </div>
      <div className="player-cs">{participant.totalMinionsKilled} CS</div>
    </div>
  );
};


const MatchDetail = ({ matchData, playerPuuid }) => {
  // Estado para a "telinha dev"
  const [isDevScreenVisible, setIsDevScreenVisible] = useState(false);
  // Estado para o feedback do botão Salvar
  const [saveStatus, setSaveStatus] = useState({ loading: false, message: '' });
  // Estado para a versão do Data Dragon
  const [gameVersion, setGameVersion] = useState('14.5.1');

  useEffect(() => {
    // Busca a versão mais recente do jogo para garantir que os ícones sejam os corretos
    const fetchLatestVersion = async () => {
      try {
        const response = await fetch('https://ddragon.leagueoflegends.com/api/versions.json');
        const versions = await response.json();
        if (versions.length > 0) setGameVersion(versions[0]);
      } catch (error) { console.error("Falha ao buscar a versão do Data Dragon:", error); }
    };
    fetchLatestVersion();
  }, []);

  if (!matchData?.info) return null;

  // Lógica para processar os dados da partida
  const { participants, gameDuration, gameMode } = matchData.info;
  const blueTeam = participants.filter(p => p.teamId === 100);
  const redTeam = participants.filter(p => p.teamId === 200);
  const minutes = Math.floor(gameDuration / 60);
  const seconds = gameDuration % 60;

  const toggleDevScreen = () => setIsDevScreenVisible(!isDevScreenVisible);

  // Função para salvar a partida no banco de dados
  const handleSaveMatch = async () => {
    setSaveStatus({ loading: true, message: 'Salvando...' });
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/lol/save-match`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(matchData),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Erro no servidor');
      setSaveStatus({ loading: false, message: 'Salvo!' });
    } catch (error) {
      console.error("Falha ao salvar a partida:", error);
      setSaveStatus({ loading: false, message: 'Erro!' });
    }
  };

  return (
    <>
      <div className="match-detail-container">
        <div className="match-header">
          <h2>Detalhes da Partida</h2>
          <div className="match-info">
            <span>{gameMode}</span>
            <span>Duração: {minutes}m {seconds}s</span>
          </div>
          <div className="header-buttons">
            <button 
              className="save-match-button" 
              onClick={handleSaveMatch}
              disabled={saveStatus.loading || saveStatus.message === 'Salvo!'}
              title="Salvar dados da partida para análise de ML"
            >
              {saveStatus.loading ? '...' : (saveStatus.message || 'Salvar Partida')}
            </button>
            <button className="dev-screen-button" onClick={toggleDevScreen} title="Exibir dados brutos (JSON)">&lt;/&gt;</button>
          </div>
        </div>
        <div className="scoreboard">
          <div className="team-scoreboard blue-team">
            <div className="team-header"><h3>Time Azul ({blueTeam.find(p => p.win)?.win ? 'Vitória' : 'Derrota'})</h3></div>
            {blueTeam.map(participant => <PlayerRow key={participant.puuid} participant={participant} playerPuuid={playerPuuid} gameVersion={gameVersion} />)}
          </div>
          <div className="team-scoreboard red-team">
            <div className="team-header"><h3>Time Vermelho ({redTeam.find(p => p.win)?.win ? 'Vitória' : 'Derrota'})</h3></div>
            {redTeam.map(participant => <PlayerRow key={participant.puuid} participant={participant} playerPuuid={playerPuuid} gameVersion={gameVersion} />)}
          </div>
        </div>
      </div>
      {isDevScreenVisible && (
        <div className="dev-screen-overlay" onClick={toggleDevScreen}>
          <div className="dev-screen-content" onClick={(e) => e.stopPropagation()}>
            <div className="dev-screen-header">
              <span>[DEV_MODE]: RAW MATCH DATA</span>
              <button onClick={toggleDevScreen}>X</button>
            </div>
            <pre>{JSON.stringify(matchData, null, 2)}</pre>
          </div>
        </div>
      )}
    </>
  );
};

export default MatchDetail;