import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import './PlayerACSchart.css';

const PlayerACSchart = ({ matchData }) => {
  // Prepara os dados para o gráfico a partir da prop recebida
  const chartData = matchData.players.map(player => ({
    name: player.gameName,
    ACS: player.stats.score,
    fill: player.teamId === 'Blue' ? '#1d4ed8' : '#b91c1c',
  }));

  // Ordena os jogadores por ACS para um visual mais limpo
  chartData.sort((a, b) => b.ACS - a.ACS);

  const CustomTooltip = ({ active, payload, label }) => {
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
      <div className="chart-wrapper">
        <ResponsiveContainer width="100%" height={400}>
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 30, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#475569" horizontal={false} />
            <XAxis type="number" stroke="#94a3b8" />
            <YAxis 
              type="category" 
              dataKey="name" 
              stroke="#94a3b8" 
              width={100} 
              tick={{ fontSize: 12 }} 
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0, 255, 255, 0.05)' }}/>
            <Bar dataKey="ACS" name="Pontuação de Combate" barSize={20}>
              {/* Pinta cada barra com a cor do time correspondente */}
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default PlayerACSchart;