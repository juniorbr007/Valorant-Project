import React, { useState, useMemo } from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend } from 'recharts';

const PlayerRadarChart = ({ matchData }) => {
  const [selectedPlayerPuuid, setSelectedPlayerPuuid] = useState(matchData.players[0].puuid);

  const selectedPlayerData = useMemo(() => {
    const player = matchData.players.find(p => p.puuid === selectedPlayerPuuid);
    if (!player) return [];

    // Normaliza os dados para o gráfico de radar. Definimos um "valor máximo esperado" para cada stat.
    const data = [
      { subject: 'Abates', value: player.stats.kills, fullMark: 30 },
      { subject: 'Assist.', value: player.stats.assists, fullMark: 20 },
      { subject: 'Pontuação', value: player.stats.score, fullMark: 8000 },
      { subject: 'Dano', value: (player.stats.damage[0]?.damage || 0) / 100, fullMark: 60 }, // Dividido por 100 para escalar
    ];
    return data;
  }, [selectedPlayerPuuid, matchData]);
  
  const handlePlayerChange = (event) => {
    setSelectedPlayerPuuid(event.target.value);
  };

  return (
    <>
      {/* O CSS foi movido para cá para resolver o erro de importação */}
      <style>{`
        .radar-chart-container {
          background-color: rgba(30, 41, 59, 0.5);
          padding: 2rem;
          border: 1px solid #475569;
          border-radius: 8px;
        }
        .chart-wrapper { /* Adicionado para consistência */
          width: 100%;
          height: 300px;
        }
        .radar-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }
        .radar-header h3 {
          color: #f1f5f9;
          margin: 0;
          font-size: 1.2rem;
          text-transform: uppercase;
        }
        .player-select {
          background-color: #1e293b;
          color: #f1f5f9;
          border: 1px solid #475569;
          border-radius: 4px;
          padding: 0.5rem;
          font-family: 'Inter', sans-serif;
        }
      `}</style>
      <div className="radar-chart-container">
        <div className="radar-header">
          <h3>Perfil de Desempenho do Jogador</h3>
          <select onChange={handlePlayerChange} value={selectedPlayerPuuid} className="player-select">
            {matchData.players.map(player => (
              <option key={player.puuid} value={player.puuid}>
                {player.gameName}
              </option>
            ))}
          </select>
        </div>
        <div className="chart-wrapper">
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={selectedPlayerData}>
              <PolarGrid stroke="#475569" />
              <PolarAngleAxis dataKey="subject" stroke="#cbd5e1" />
              <PolarRadiusAxis angle={30} domain={[0, 'dataMax + 5']} tick={false} axisLine={false} />
              <Radar name={matchData.players.find(p => p.puuid === selectedPlayerPuuid)?.gameName} dataKey="value" stroke="#00ffff" fill="#00ffff" fillOpacity={0.6} />
              <Legend wrapperStyle={{ color: '#cbd5e1' }} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </>
  );
};

export default PlayerRadarChart;

