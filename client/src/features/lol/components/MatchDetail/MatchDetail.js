import React, { useState, useEffect } from 'react';
import './MatchDetail.css';

// ... (O sub-componente PlayerRow continua exatamente o mesmo)
const PlayerRow = ({ participant, playerPuuid }) => {
  const [gameVersion, setGameVersion] = useState('14.5.1');
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
  const championIconUrl = `https://ddragon.leagueoflegends.com/cdn/${gameVersion}/img/champion/${participant.championName}.png`;
  const getItemIconUrl = (itemId) => `https://ddragon.leagueoflegends.com/cdn/${gameVersion}/img/item/${itemId}.png`;
  const isMainPlayer = participant.puuid === playerPuuid;
  const summonerDisplay = (
    <div className="summoner-identity">
      <span className="summoner-name">{participant.riotIdName || participant.summonerName}</span>
      {participant.riotIdTagline && <span className="tag-line">#{participant.riotIdTagline}</span>}
    </div>
  );
  return (
    <div className={`player-row ${isMainPlayer ? 'main-player' : ''}`}>
      <div className="player-info"><img src={championIconUrl} alt={participant.championName} className="champion-icon" />{summonerDisplay}</div>
      <div className="player-kda">{`${participant.kills} / ${participant.deaths} / ${participant.assists}`}</div>
      <div className="player-items">{[0, 1, 2, 3, 4, 5].map(index => (participant[`item${index}`] ? <img key={index} src={getItemIconUrl(participant[`item${index}`])} alt={`Item ${index}`} /> : <div key={index} className="item-slot"></div>))}</div>
      <div className="player-cs">{participant.totalMinionsKilled} CS</div>
    </div>
  );
};


const MatchDetail = ({ matchData, playerPuuid }) => {
  // --- NOVO: Estado para controlar a visibilidade da tela de dev ---
  const [isDevScreenVisible, setIsDevScreenVisible] = useState(false);

  if (!matchData?.info) return null;

  const { participants, gameDuration, gameMode } = matchData.info;
  const blueTeam = participants.filter(p => p.teamId === 100);
  const redTeam = participants.filter(p => p.teamId === 200);
  const minutes = Math.floor(gameDuration / 60);
  const seconds = gameDuration % 60;

  // --- NOVO: Função para alternar a visibilidade ---
  const toggleDevScreen = () => {
    setIsDevScreenVisible(!isDevScreenVisible);
  };

  return (
    // Usamos um React.Fragment <> para poder renderizar o modal no mesmo nível
    <>
      <div className="match-detail-container">
        <div className="match-header">
          <h2>Detalhes da Partida</h2>
          <div className="match-info">
            <span>{gameMode}</span>
            <span>Duração: {minutes}m {seconds}s</span>
          </div>
          
          {/* --- NOVO: Botão para abrir a tela de dev --- */}
          <button className="dev-screen-button" onClick={toggleDevScreen} title="Exibir dados brutos (JSON)">
            &lt;/&gt;
          </button>
        </div>

        <div className="scoreboard">
          <div className="team-scoreboard blue-team">
            <div className="team-header"><h3>Time Azul ({blueTeam.find(p => p.win)?.win ? 'Vitória' : 'Derrota'})</h3></div>
            {blueTeam.map(participant => <PlayerRow key={participant.puuid} participant={participant} playerPuuid={playerPuuid} />)}
          </div>
          <div className="team-scoreboard red-team">
            <div className="team-header"><h3>Time Vermelho ({redTeam.find(p => p.win)?.win ? 'Vitória' : 'Derrota'})</h3></div>
            {redTeam.map(participant => <PlayerRow key={participant.puuid} participant={participant} playerPuuid={playerPuuid} />)}
          </div>
        </div>
      </div>

      {/* --- NOVO: Renderização condicional da tela de dev --- */}
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