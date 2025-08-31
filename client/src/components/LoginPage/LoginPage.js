import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import './LoginPage.css';
import { RiSwordFill, RiBarChartFill, RiPieChart2Fill, RiTeamFill, RiLoader4Line } from "react-icons/ri";

const LoginPage = () => {
  // Estado para controlar o feedback visual de carregamento no botão
  const [isLoading, setIsLoading] = useState(false);
  
  // Estado para armazenar e exibir mensagens de erro
  const [errorMessage, setErrorMessage] = useState('');
  
  // Hook para ler os parâmetros da URL (ex: ?error=auth_failed)
  const [searchParams] = useSearchParams();

  // useEffect é executado uma vez quando o componente carrega
  // para verificar se há uma mensagem de erro na URL.
  useEffect(() => {
    if (searchParams.get('error') === 'auth_failed') {
      setErrorMessage('Ocorreu um erro na autenticação. Por favor, tente novamente.');
    }
  }, [searchParams]);

  // Função acionada ao clicar no botão de login
  const onLoginClick = () => {
    setIsLoading(true); // Ativa o estado de carregamento
    // Redireciona para o backend para iniciar o fluxo de autenticação com a Riot
    window.location.href = 'https://valorant-7w4h.onrender.com/auth/riot';
  };

  return (
    <div className="login-container">
      <div className="split-card">
        
        {/* PAINEL ESQUERDO: A AÇÃO */}
        <div className="login-panel">
          <div className="login-box">
            
            {/* Exibe a mensagem de erro apenas se ela existir */}
            {errorMessage && <p className="error-message">{errorMessage}</p>}
            
            <h1 className="brand-title">CYPHER'S EDGE</h1>
            <p className="brand-subtitle">Desvende seu potencial tático. Analise cada movimento, domine cada partida.</p>
            
            <button className="login-button" onClick={onLoginClick} disabled={isLoading}>
              {isLoading ? (
                <>
                  <RiLoader4Line className="icon-spin" />
                  Conectando...
                </>
              ) : (
                <>
                  <RiSwordFill /> 
                  Analisar meu Desempenho
                </>
              )}
            </button>
          </div>
        </div>

        {/* PAINEL DIREITO: A VISUALIZAÇÃO (O TEASER) */}
        <div className="preview-panel">
          <div className="feature-card">
            <RiBarChartFill size={30} />
            <h4>Performance por Mapa</h4>
            <p>Descubra suas taxas de vitória e KDA em cada mapa.</p>
          </div>
          <div className="feature-card">
            <RiPieChart2Fill size={30} />
            <h4>Maestria com Agentes</h4>
            <p>Visualize suas estatísticas com seus agentes mais jogados.</p>
          </div>
          <div className="feature-card">
            <RiTeamFill size={30} />
            <h4>Análise de Confrontos</h4>
            <p>Veja como você se sai contra diferentes composições de equipe.</p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default LoginPage;