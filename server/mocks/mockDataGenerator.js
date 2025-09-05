const fs = require('fs');
const path = require('path');

// --- Funções Geradoras ---

const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// NOVO: Função para embaralhar um array (algoritmo Fisher-Yates)
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]]; // Troca os elementos
  }
}

const generatePlayerStats = () => {
  const kills = getRandomInt(8, 28);
  const deaths = getRandomInt(10, 20);
  const assists = getRandomInt(2, 15);
  const score = kills * 150 + assists * 50 + getRandomInt(-500, 500);
  const damage = getRandomInt(100, 250) * getRandomInt(18, 24);
  return { kills, deaths, assists, score, playtimeMillis: getRandomInt(1800000, 2400000), damage: [{ damage }], economy: { spent: getRandomInt(60000, 100000), loadoutValue: getRandomInt(3000, 5000) } };
};

const AGENTS = ['Jett', 'Phoenix', 'Sage', 'Sova', 'Brimstone', 'Viper', 'Omen', 'Cypher', 'Reyna', 'Killjoy'];
const PLAYER_NAMES = ['PlayerOne', 'Ninja', 'Shroud', 'Tenz', 'ScreaM', 'Mixwell', 'Hiko', 'Steel', 'Ace', 'Sacy'];
const TAGS = ['BR1', 'LAS', 'NA1', 'EUW', 'KR1'];
const MAPS = ['Ascent', 'Bind', 'Haven', 'Split', 'Icebox'];

// MUDANÇA: A função agora recebe o nome do jogador como parâmetro
const createPlayer = (playerName, teamId, agent) => ({
  puuid: `puuid-${playerName}-${getRandomInt(1000, 9999)}`,
  gameName: playerName,
  tagLine: TAGS[getRandomInt(0, 4)],
  teamId,
  partyId: `party-${getRandomInt(1, 5)}`,
  characterId: agent,
  stats: generatePlayerStats(),
  competitiveTier: getRandomInt(15, 25)
});


// --- LÓGICA PRINCIPAL ATUALIZADA ---
console.log("Iniciando a geração de dados de partidas e histórico...");
const historyList = []; 

for (let i = 1; i <= 5; i++) {
  const matchId = `match-${i}`;
  const skeletonPath = path.join(__dirname, 'match-details-skeleton.json');
  const matchData = JSON.parse(fs.readFileSync(skeletonPath, 'utf-8'));

  matchData.matchInfo.matchId = matchId;
  matchData.matchInfo.mapId = `/Game/Maps/${MAPS[i-1]}/${MAPS[i-1]}`;
  matchData.matchInfo.gameLengthMillis = getRandomInt(1800000, 2400000);

  // MUDANÇA: Embaralha os jogadores e os agentes para esta partida
  const shuffledPlayers = [...PLAYER_NAMES];
  const shuffledAgents = [...AGENTS];
  shuffleArray(shuffledPlayers);
  shuffleArray(shuffledAgents);
  
  matchData.players = [];
  for (let p = 0; p < 10; p++) {
    const team = p < 5 ? 'Blue' : 'Red';
    // Usa os nomes e agentes embaralhados
    matchData.players.push(createPlayer(shuffledPlayers[p], team, shuffledAgents[p]));
  }

  matchData.roundResults = [];
  let blueRoundsWon = 0;
  let redRoundsWon = 0;
  while (blueRoundsWon < 13 && redRoundsWon < 13) {
    const winner = Math.random() > 0.5 ? 'Blue' : 'Red';
    if (winner === 'Blue') blueRoundsWon++; else redRoundsWon++;
    matchData.roundResults.push({ roundNum: blueRoundsWon + redRoundsWon, winningTeam: winner });
  }

  matchData.teams = [];
  matchData.teams.push({ teamId: 'Blue', won: blueRoundsWon > redRoundsWon, roundsWon: blueRoundsWon, roundsPlayed: blueRoundsWon + redRoundsWon });
  matchData.teams.push({ teamId: 'Red', won: redRoundsWon > blueRoundsWon, roundsWon: redRoundsWon, roundsPlayed: blueRoundsWon + redRoundsWon });

  historyList.push({
    id: matchId,
    map: MAPS[i-1],
    result: blueRoundsWon > redRoundsWon ? 'Vitória' : 'Derrota',
    score: `${blueRoundsWon} - ${redRoundsWon}`,
    agent: 'Aleatório' // O agente do "nosso" jogador agora é aleatório
  });

  const outputPath = path.join(__dirname, `${matchId}.json`);
  fs.writeFileSync(outputPath, JSON.stringify(matchData, null, 2));
  console.log(`-> Arquivo ${matchId}.json gerado com sucesso!`);
}

const historyPath = path.join(__dirname, 'match-history.json');
fs.writeFileSync(historyPath, JSON.stringify(historyList, null, 2));
console.log(`-> Arquivo match-history.json gerado com sucesso!`);

console.log("Geração de dados concluída.");

