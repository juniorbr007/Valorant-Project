// src/components/pages/GameSelectionPage.js

import React from 'react';
import { useNavigate } from 'react-router-dom';
import './GameSelectionPage.css';

// Importe as imagens de fundo que usaremos
import lolBackground from '../../assets/images/lol-background.jpg';
import valorantBackground from '../../assets/images/valorant-background.jpg';

const GameSelectionPage = () => {
  const navigate = useNavigate();

  return (
    <div className="game-selection-container">
      <div
        className="game-card"
        style={{ backgroundImage: `url(${lolBackground})` }}
        onClick={() => navigate('/lol/dashboard')}
      >
        <div className="game-card-overlay">
          <h2>League of Legends</h2>
        </div>
      </div>
      <div
        className="game-card"
        style={{ backgroundImage: `url(${valorantBackground})` }}
        onClick={() => navigate('/valorant/dashboard')}
      >
        <div className="game-card-overlay">
          <h2>Valorant</h2>
        </div>
      </div>
    </div>
  );
};

export default GameSelectionPage;