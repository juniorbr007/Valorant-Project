import React, { useState, useEffect } from 'react';
import './GameSelectionScreen.css';

// --- Sub-componente para o Card do Jogo (Deixa o código principal mais limpo) ---
const GameCard = ({ game, image, onSelect, isLoading }) => {
  if (isLoading) {
    return <div className="game-card skeleton-card"></div>;
  }

  return (
    <div 
      className={`game-card ${game.id}`} 
      onClick={onSelect}
      style={{ backgroundImage: `url(${image})` }}
    >
      <div className="game-card-overlay"></div>
      <div className="game-card-content">
        <div className="content-inner">
          <h3>{game.name}</h3>
          <p>{game.description}</p>
        </div>
      </div>
    </div>
  );
};


const GameSelectionScreen = ({ onSelectGame }) => {
  const [valorantImage, setValorantImage] = useState('');
  const [lolImage, setLolImage] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchGameImages = async () => {
      setIsLoading(true);
      try {
        // --- Busca da Imagem do Valorant (mesmo método, mais seguro) ---
        const valResponse = await fetch('https://valorant-api.com/v1/agents/e370fa57-4757-3604-3648-499e1f642d3f?language=pt-BR'); // Usando a Jett
        const valData = await valResponse.json();
        setValorantImage(valData.data?.fullPortrait || 'URL_FALLBACK_VALORANT');

        // --- NOVO: Busca da Imagem do League of Legends via Data Dragon (Oficial da Riot) ---
        // 1. Pega a versão mais recente do jogo
        const versionsResponse = await fetch('https://ddragon.leagueoflegends.com/api/versions.json');
        const versions = await versionsResponse.json();
        const latestVersion = versions[0];
        
        // 2. Constrói a URL para um campeão específico (ex: Jhin)
        const championName = 'Jhin';
        const splashArtUrl = `https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${championName}_0.jpg`;
        setLolImage(splashArtUrl);

      } catch (error) {
        console.error("Falha ao buscar imagens dos jogos:", error);
        // Coloque URLs de fallback caso a API falhe
        setValorantImage('https://images.alphacoders.com/132/1323249.png');
        setLolImage('https://images.alphacoders.com/133/1338923.png'); // URL de fallback diferente
      } finally {
        // Adiciona um pequeno delay para a transição do loading ser mais suave
        setTimeout(() => setIsLoading(false), 500);
      }
    };
    fetchGameImages();
  }, []);

  const games = {
    valorant: { id: 'valorant', name: 'Valorant', description: 'Análise de partidas e estatísticas. (Simulação)' },
    lol: { id: 'lol', name: 'League of Legends', description: 'Busque históricos e analise o desempenho. (API Real)' }
  };

  return (
    <div className="game-selection-container">
      <h2 data-text="Escolha sua Arena">Escolha sua Arena</h2>
      <div className="game-cards-perspective">
        <GameCard 
          game={games.valorant}
          image={valorantImage}
          onSelect={() => onSelectGame('valorant')}
          isLoading={isLoading}
        />
        <GameCard 
          game={games.lol}
          image={lolImage}
          onSelect={() => onSelectGame('lol')}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};

export default GameSelectionScreen;