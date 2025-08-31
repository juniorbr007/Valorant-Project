import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';

// Importando todos os componentes de layout e página
import LoginPage from './components/LoginPage/LoginPage';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';
import Footer from './components/Footer/Footer';
import Navbar from './components/Navbar/Navbar';
import AgentsPage from './components/AgentsPage/AgentsPage';
import AgentDetailPage from './components/AgentDetailPage/AgentDetailPage';

// Importando os componentes do Dashboard
import DashboardLayout from './components/DashboardLayout/DashboardLayout';
import DashboardOverview from './components/DashboardOverview/DashboardOverview';
import PerformancePage from './components/PerformancePage/PerformancePage';
import ModelLabPage from './components/ModelLabPage/ModelLabPage';

function App() {
  // Inicia como 'true' em ambiente de desenvolvimento, e 'false' em produção.
  const [isAuthenticated, setIsAuthenticated] = useState(process.env.NODE_ENV === 'development');

  const handleLogin = () => { setIsAuthenticated(true); };
  const handleLogout = () => { setIsAuthenticated(false); };

  return (
    <Router>
      <div className="App">
        {isAuthenticated && <Navbar handleLogout={handleLogout} />}
        
        <main className="main-content">
          <Routes>
            {/* Rota da Página de Login */}
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

            {/* ROTA PRINCIPAL DO DASHBOARD (ANINHADA) */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute isAuthenticated={isAuthenticated}>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              {/* Rota aninhada padrão (quando se acessa /dashboard) */}
              <Route index element={<DashboardOverview />} />
              {/* Rota aninhada para os gráficos */}
              <Route path="charts" element={<PerformancePage />} />
              {/* Rota aninhada para o laboratório de modelos */}
              <Route path="lab" element={<ModelLabPage />} />
            </Route>

            {/* ROTAS DE AGENTES */}
            <Route 
              path="/agents" 
              element={
                <ProtectedRoute isAuthenticated={isAuthenticated}>
                  <AgentsPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/agents/:agentId" 
              element={
                <ProtectedRoute isAuthenticated={isAuthenticated}>
                  <AgentDetailPage />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </main>
        
        {!isAuthenticated && <Footer />}
      </div>
    </Router>
  );
}

export default App;
