import React from 'react';
import './LoginPage.css';

// Recebe a função handleLogin como uma "prop"
const LoginPage = ({ handleLogin }) => {

  const onLoginClick = () => {
    // Por enquanto, apenas chamamos a função de simulação.
    // No futuro, a chamada para window.location.href irá aqui.
    handleLogin(); 
  };

  return (
    <div className="login-container">
      <h2>Bem-vindo</h2>
      <p>Faça o login com sua conta Riot Games para analisar suas estatísticas.</p>
      <button className="login-button" onClick={onLoginClick}>
        Entrar com a Riot Games
      </button>
    </div>
  );
};

export default LoginPage;