import React from 'react';
import './LoginPage.css';
// 1. Importa um ícone da biblioteca. "Ri" significa Remix Icon.
import { RiSwordFill } from "react-icons/ri";

const LoginPage = ({ handleLogin }) => {

  const onLoginClick = () => {
    window.location.href = 'https://valorant-7w4h.onrender.com/auth/riot';
  };

  return (
    <div className="login-container">
      <div className="login-box"> {/* Adicionamos uma div para o painel */}
        <h2>SEJA BEM-VINDO, AGENTE</h2>
        <p>Conecte-se com sua conta Riot para acessar dados táticos de suas partidas.</p>
        <button className="login-button" onClick={onLoginClick}>
          {/* 2. Adiciona o ícone ao lado do texto */}
          <RiSwordFill /> 
          Entrar com a Riot Games
        </button>
      </div>
    </div>
  );
};

export default LoginPage;