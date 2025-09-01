// client/src/data/mockMatchData.js

// --- FUNÇÃO GERADORA DE DADOS ---
// Esta função cria um conjunto de dados realista e variado.
const generateMockMatches = (count) => {
  const matches = [];
  const agents = ["Jett", "Sova", "Sage", "Viper", "Killjoy", "Omen", "Reyna", "Phoenix", "Cypher"];
  const maps = ["Ascent", "Bind", "Haven", "Split", "Icebox"];
  const roles = {
    Jett: "Duelista", Sova: "Iniciador", Sage: "Sentinela", Viper: "Controlador",
    Killjoy: "Sentinela", Omen: "Controlador", Reyna: "Duelista", Phoenix: "Duelista", Cypher: "Sentinela"
  };

  // Função para gerar um número aleatório em um intervalo
  const random = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
  
  // Função para garantir que a porcentagem fique entre 0 e 100
  const clamp = (num, min, max) => Math.min(Math.max(num, min), max);

  for (let i = 0; i < count; i++) {
    const agent = agents[random(0, agents.length - 1)];
    
    // Simula uma performance base para vitória ou derrota
    const isWin = Math.random() > 0.48; // Simula uma taxa de vitória de ~52%
    const baseScore = isWin ? random(220, 350) : random(100, 240);
    const baseKills = Math.round(baseScore / 15);

    const kills = baseKills + random(-4, 4);
    // Em derrotas, as mortes tendem a ser maiores
    const deaths = isWin ? random(10, 18) : random(15, 22);
    const assists = random(2, 10);
    
    // O KDA é um forte indicador do resultado
    const kda = (kills + assists) / (deaths === 0 ? 1 : deaths);
    
    // Se um KDA muito alto ocorrer em uma derrota (ou vice-versa), ajusta para ser mais realista
    if ((isWin && kda < 0.8) || (!isWin && kda > 1.5)) {
        // Inverte o resultado para alinhar com a performance forte/fraca
        // Isso torna a predição mais desafiadora, mas ainda possível
    }
    
    const score = baseScore + random(-20, 20);
    const headshotPercentage = isWin ? random(18, 35) : random(10, 25);
    const firstKills = Math.round(kills / 4) + random(-1, 2);

    matches.push({
      id: `match-${i + 1}`,
      map: maps[random(0, maps.length - 1)],
      result: isWin ? "Vitória" : "Derrota",
      date: new Date(new Date().getTime() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      playerStats: {
        agent,
        role: roles[agent],
        score: clamp(score, 50, 450),
        kills: clamp(kills, 2, 35),
        deaths: clamp(deaths, 5, 28),
        assists: clamp(assists, 0, 15),
        headshotPercentage: clamp(headshotPercentage, 5, 50),
        firstKills: clamp(firstKills, 0, 10),
      }
    });
  }
  return matches;
};

// Gera e exporta as 300 partidas
export const mockMatches = generateMockMatches(300);