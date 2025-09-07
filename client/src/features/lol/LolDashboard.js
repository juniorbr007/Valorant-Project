import React, { useState } from 'react';
import './LolDashboard.css'; // Vamos criar este arquivo a seguir

const LolDashboard = () => {
  const [riotId, setRiotId] = useState('');
  const [tagLine, setTagLine] = useState('');
  const [playerData, setPlayerData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!riotId || !tagLine) {
      setError('Por favor, preencha o Riot ID e a Tag Line.');
      return;
    }

    setIsLoading(true);
    setError('');
    setPlayerData(null);

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/lol/player/${riotId}/${tagLine}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erro desconhecido.');
      }
      
      setPlayerData(data); // Sucesso! Armazenamos os dados do jogador.

    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="lol-dashboard-container">
      <div className="search-container">
        <h2>Buscar Invocador</h2>
        <form onSubmit={handleSearch}>
          <div className="input-group">
            <input 
              type="text" 
              placeholder="Riot ID"
              value={riotId}
              onChange={(e) => setRiotId(e.target.value)}
            />
            <span>#</span>
            <input 
              type="text" 
              placeholder="Tag"
              value={tagLine}
              onChange={(e) => setTagLine(e.target.value)}
              className="tagline-input"
            />
          </div>
          <button type="submit" disabled={isLoading}>
            {isLoading ? 'Buscando...' : 'Buscar'}
          </button>
        </form>
      </div>

      {error && <p className="error-message">{error}</p>}
      
      {/* Por enquanto, vamos apenas exibir o JSON bruto para confirmar que funcionou */}
      {playerData && (
        <div className="results-container">
          <h3>Dados da Conta (PUUID):</h3>
          <pre>{JSON.stringify(playerData, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default LolDashboard;
