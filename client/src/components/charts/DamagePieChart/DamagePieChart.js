import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const DamagePieChart = ({ matchData, teamId }) => {
  const teamPlayers = matchData.players.filter(p => p.teamId === teamId);
  
  // O dano no mock está em player.stats.damage[0].damage
  const totalTeamDamage = teamPlayers.reduce((sum, player) => sum + (player.stats.damage[0]?.damage || 0), 0);

  const chartData = teamPlayers.map(player => ({
    name: player.gameName,
    value: player.stats.damage[0]?.damage || 0,
  }));

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF'];

  return (
    <>
      {/* O CSS foi movido para cá para resolver o erro de importação */}
      <style>{`
        .pie-chart-container {
          background-color: rgba(30, 41, 59, 0.5);
          padding: 2rem;
          border: 1px solid #475569;
          border-radius: 8px;
        }
        .pie-chart-container h3 {
          color: #f1f5f9;
          text-align: center;
          margin-top: 0;
          margin-bottom: 1.5rem;
          font-size: 1.2rem;
          text-transform: uppercase;
        }
        .chart-wrapper {
          width: 100%;
          height: 300px;
        }
        /* Garante que o texto da legenda seja legível */
        .recharts-legend-item-text {
          color: #cbd5e1 !important;
        }
        /* Garante que o texto dentro do gráfico seja legível */
        .recharts-pie-label-text {
          fill: #f1f5f9;
          font-size: 14px;
        }
      `}</style>
      <div className="pie-chart-container">
        <h3>Contribuição de Dano - Time {teamId}</h3>
        <div className="chart-wrapper">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={110}
                fill="#8884d8"
                dataKey="value"
                nameKey="name"
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `${value} de dano`} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </>
  );
};

export default DamagePieChart;

