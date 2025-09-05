const fs = require('fs');
const path = require('path');

// --- Funções para gerar dados aleatórios ---

const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const generatePlayerStats = () => {
  const kills = getRandomInt(5, 30);
  const deaths = getRandomInt(10, 22);
  const assists = getRandomInt(2, 18);
  const score = kills * 150 + assists * 50 + getRandomInt(-500, 500);
  const damage = getRandomInt(100, 250) * getRandomInt(18, 25); // ADR * rounds
  return {
    kills,
    deaths,
    assists,
    score,
    playtimeMillis: getRandomInt(2000000, 2165000),
    damage: [{ damage }],
    economy: { spent: getRandomInt(60000, 100000), loadoutValue: getRandomInt(3000, 5000) }
  };
};

const AGENTS = ['Jett', 'Phoenix', 'Sage', 'Sova', 'Brimstone', 'Viper', 'Omen', 'Cypher', 'Reyna', 'Killjoy'];
const PLAYER_NAMES = ['PlayerOne', 'Ninja', 'Shroud', 'Tenz', 'ScreaM', 'Mixwell', 'Hiko', 'Steel', 'Ace', 'Sacy'];
const TAGS = ['BR1', 'LAS', 'NA1', 'EUW', 'KR1'];

const createPlayer = (index, teamId) => ({
  puuid: `puuid-player-${index}-${getRandomInt(1000, 9999)}`,
  gameName: PLAYER_NAMES[index],
  tagLine: TAGS[getRandomInt(0, 4)],
  teamId,
  partyId: `party-${getRandomInt(1, 5)}`,
  characterId: AGENTS[index],
  stats: generatePlayerStats(),
  competitiveTier: getRandomInt(15, 25)
});

// --- LÓGICA PRINCIPAL: Gerar múltiplos arquivos ---

console.log("Iniciando a geração de múltiplos arquivos de partidas...");

// Loop para criar 5 arquivos diferentes
for (let i = 1; i <= 5; i++) {
  const matchId = `match-${i}`;
  
  // 1. Carrega o esqueleto a cada iteração para começar do zero
  const skeletonPath = path.join(__dirname, 'match-details-skeleton.json');
  const matchData = JSON.parse(fs.readFileSync(skeletonPath, 'utf-8'));

  // Atualiza a ID da partida no esqueleto
  matchData.matchInfo.matchId = matchId;

  // 2. Gera 10 jogadores com stats aleatórios
  matchData.players = [];
  for (let p = 0; p < 10; p++) {
    const team = p < 5 ? 'Blue' : 'Red';
    matchData.players.push(createPlayer(p, team));
  }

  // 3. Gera resultados de rounds
  matchData.roundResults = [];
  let blueRoundsWon = 0;
  let redRoundsWon = 0;
  while (blueRoundsWon < 13 && redRoundsWon < 13) {
    const winner = Math.random() > 0.5 ? 'Blue' : 'Red';
    if (winner === 'Blue') blueRoundsWon++;
    else redRoundsWon++;
    matchData.roundResults.push({ roundNum: blueRoundsWon + redRoundsWon, winningTeam: winner });
  }

  // 4. Gera dados dos times com base nos rounds
  matchData.teams = [];
  matchData.teams.push({ teamId: 'Blue', won: blueRoundsWon > redRoundsWon, roundsWon: blueRoundsWon, roundsPlayed: blueRoundsWon + redRoundsWon });
  matchData.teams.push({ teamId: 'Red', won: redRoundsWon > blueRoundsWon, roundsWon: redRoundsWon, roundsPlayed: blueRoundsWon + redRoundsWon });

  // 5. Salva o arquivo JSON com o nome da partida (ex: match-1.json)
  const outputPath = path.join(__dirname, `${matchId}.json`);
  fs.writeFileSync(outputPath, JSON.stringify(matchData, null, 2));

  console.log(`-> Arquivo ${outputPath} gerado com sucesso!`);
}

console.log("\nGeração de dados concluída. 5 partidas fictícias foram criadas.");

