import React, { useState, useEffect } from 'react';
import ValorantDashboard from './components/features/valorant/ValorantDashboard';
import './App.css';


// --- Componentes "Placeholder" ---
const Header = () => (
  <header className="app-header">
    <h1>Cypher's Edge</h1>
    <p>Sua plataforma de análise de performance</p>
  </header>
);


const LolDashboard = () => (
  <div style={{ padding: '2rem', color: '#f0f0f0', textAlign: 'center' }}>
    <h2>Dashboard do League of Legends</h2>
    <p>(Esta é a nova seção que construiremos usando a API real)</p>
  </div>
);

// --- Componente da Tela de Seleção (Atualizado) ---
const GameSelectionScreen = ({ onSelectGame }) => {
  const [valorantImage, setValorantImage] = useState('');
  const [lolImage, setLolImage] = useState('');

  useEffect(() => {
    const fetchGameImages = async () => {
      try {
        const valResponse = await fetch('https://valorant-api.com/v1/agents/add6443a-41bd-e414-f6ad-e58d267f4e95?language=pt-BR');
        const valData = await valResponse.json();
        if (valData.data && valData.data.fullPortrait) {
          setValorantImage(valData.data.fullPortrait);
        } else {
          setValorantImage('https://images.alphacoders.com/132/1323249.png');
        }

        // NOVO LINK para a imagem do League of Legends
        setLolImage('https://images5.alphacoders.com/131/1317066.jpeg');
        
      } catch (error) {
        console.error("Falha ao buscar imagens dos jogos:", error);
        setValorantImage('https://images.alphacoders.com/132/1323249.png');
        setLolImage('https://images5.alphacoders.com/131/1317066.jpeg');
      }
    };

    fetchGameImages();
  }, []);

  return (
    <div className="game-selection-container">
      <h2>Selecione o Jogo para Análise</h2>
      <div className="game-cards">
        <div 
          className="game-card valorant" 
          onClick={() => onSelectGame('valorant')}
          style={{ backgroundImage: `url(${valorantImage})` }}
        >
          <div className="game-card-overlay"></div>
          <div className="game-card-content">
            <h3>Valorant</h3>
            <p>Análise de partidas e estatísticas. (Simulação)</p>
          </div>
        </div>
        
        <div 
          className="game-card lol" 
          onClick={() => onSelectGame('lol')}
          style={{ backgroundImage: `url(${lolImage})` }}
        >
          <div className="game-card-overlay"></div>
          <div className="game-card-content">
            <h3>League of Legends</h3>
            <p>Busque históricos e analise o desempenho. (API Real)</p>
          </div>
        </div>
      </div>
    </div>
  );
};


// --- Componente Principal App ---
function App() {
  const [selectedGame, setSelectedGame] = useState(null);

  const renderContent = () => {
    if (selectedGame === 'valorant') {
      return <ValorantDashboard />;
    }
    if (selectedGame === 'lol') {
      return <LolDashboard />;
    }
    return <GameSelectionScreen onSelectGame={setSelectedGame} />;
  };

  return (
    <>
      <style>{`
        /* --- ESTILOS GERAIS E LAYOUT PRINCIPAL --- */
        body {
          margin: 0;
          font-family: 'Inter', sans-serif;
          /* NOVO PLANO DE FUNDO */
          background-color: #0f172a; /* Cor de fallback */
          background-image: radial-gradient(circle at top left, rgba(0, 255, 255, 0.1), transparent 40%),
                            radial-gradient(circle at bottom right, rgba(29, 78, 216, 0.1), transparent 40%);
          color: #f0f0f0;
          overflow-x: hidden; /* Previne scroll horizontal */
        }

        .app-container {
          display: flex;
          flex-direction: column;
          min-height: 100vh;
        }

        .content-wrapper {
          flex: 1;
        }

        .app-header {
          padding: 1rem 2rem;
          background-color: rgba(15, 23, 42, 0.8);
          backdrop-filter: blur(10px);
          color: #f0f0f0;
          text-align: center;
          border-bottom: 1px solid #00ffff;
          box-shadow: 0 2px 10px rgba(0, 255, 255, 0.2);
          position: sticky;
          top: 0;
          z-index: 10;
        }

        /* --- ESTILOS DA TELA DE SELEÇÃO DE JOGO --- */
        .game-selection-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 4rem 2rem;
          min-height: calc(100vh - 100px); /* Ajusta altura */
        }

        .game-selection-container h2 {
          font-size: 2.8rem;
          margin-bottom: 3rem;
          text-shadow: 0 0 15px rgba(0, 255, 255, 0.6);
        }

        .game-cards {
          display: flex;
          gap: 2.5rem;
          flex-wrap: wrap;
          justify-content: center;
        }

        .game-card {
          /* CARDS MAIORES */
          width: 400px;
          height: 500px;
          border-radius: 12px;
          border: 2px solid #475569;
          cursor: pointer;
          transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1); /* Animação mais suave */
          position: relative;
          overflow: hidden;
          background-size: cover;
          background-position: center;
          display: flex;
          align-items: flex-end; /* Alinha conteúdo na base */
        }

        /* ANIMAÇÃO APRIMORADA */
        .game-card:hover {
          transform: scale(1.05) translateY(-10px);
          box-shadow: 0 10px 40px rgba(0, 255, 255, 0.4);
          border-color: #00ffff;
        }

        /* Camada de sobreposição para escurecer a imagem e melhorar o contraste do texto */
        .game-card-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(to top, rgba(15, 23, 42, 0.95) 20%, rgba(15, 23, 42, 0.5) 50%, transparent 100%);
          transition: background 0.4s ease;
        }

        .game-card:hover .game-card-overlay {
          background: linear-gradient(to top, rgba(15, 23, 42, 0.8) 10%, transparent 80%);
        }

        .game-card-content {
          position: relative; /* Fica acima da camada de overlay */
          z-index: 2;
          width: 100%;
          padding: 1.5rem;
          text-align: left;
          box-sizing: border-box; /* Garante que o padding não estoure o tamanho */
        }

        .game-card h3 {
          font-size: 2.2rem;
          margin-top: 0;
          margin-bottom: 0.5rem;
          text-shadow: 0 2px 5px #000;
        }

        .game-card p {
          font-size: 1rem;
          color: #cbd5e1;
          text-shadow: 0 1px 3px #000;
        }
      `}</style>
      <div className="app-container">
        <Header />
        <main className="content-wrapper">
          {renderContent()}
        </main>
      </div>
    </>
  );
}

export default App;

