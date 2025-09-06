import React from 'react';
import './Navbar.css';

// A Navbar agora recebe a view atual (para destacar o link ativo)
// e a função onNavigate para mudar de página.
const Navbar = ({ currentView, onNavigate }) => {
  return (
    <header className="app-navbar">
      <div className="navbar-content">
        {/* O logo/marca agora navega para a tela de seleção */}
        <div 
          className="navbar-brand" 
          onClick={() => onNavigate('selection')} 
          title="Voltar para a seleção de jogos"
          role="button"
          tabIndex={0}
          onKeyPress={(e) => e.key === 'Enter' && onNavigate('selection')}
        >
          <h1>Cypher's Edge</h1>
        </div>
        
        {/* Links de navegação */}
        <nav>
          <ul className="nav-links">
            {/* O link do Dashboard agora é condicional. Ele só aparece se um jogo foi selecionado */}
            {(currentView === 'valorantDashboard' || currentView === 'lolDashboard') && (
              <li 
                className={currentView.includes('Dashboard') ? 'active' : ''}
                onClick={() => onNavigate(currentView)} // Volta para o dashboard atual
                role="button"
                tabIndex={0}
              >
                Dashboard
              </li>
            )}
            <li 
              className={currentView === 'agents' ? 'active' : ''}
              onClick={() => onNavigate('agents')}
              role="button"
              tabIndex={0}
            >
              Agentes
            </li>
            {/* Adicione outros links aqui se precisar */}
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;

