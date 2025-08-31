import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react'; // 1. Importa o useState

// Importa nossos componentes
import LoginPage from './components/LoginPage';
import DashboardPage from './components/DashboardPage';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  // 2. Cria o nosso "estado" para lembrar se o usuário está logado. Começa como falso.
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // 3. Funções para simular o login e logout
  const handleLogin = () => {
    // No futuro, esta função será chamada após a resposta bem-sucedida da API da Riot.
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route 
            path="/" 
            element={
              !isAuthenticated ? (
                <LoginPage handleLogin={handleLogin} />
              ) : (
                <Navigate to="/dashboard" />
              )
            } 
          />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <DashboardPage handleLogout={handleLogout} />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;