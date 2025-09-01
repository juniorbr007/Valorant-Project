import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';

// Importando todos os componentes de layout e página
import LoginPage from './components/auth/LoginPage/LoginPage';
import ProtectedRoute from './components/auth/ProtectedRoute/ProtectedRoute';
import Footer from './components/layouts/Footer/Footer';
import Navbar from './components/layouts/Navbar/Navbar';
import AgentsPage from './components/pages/AgentsPage/AgentsPage';
import AgentDetailPage from './components/pages/AgentDetailPage/AgentDetailPage';

// Importando os componentes do Dashboard
import DashboardLayout from './components/layouts/DashboardLayout/DashboardLayout';
import DashboardOverview from './components/pages/DashboardOverview/DashboardOverview';
import PerformancePage from './components/pages/PerformancePage/PerformancePage';
import ModelLabPage from './components/pages/ModelLabPage/ModelLabPage';
import RoadmapPage from './components/pages/RoadmapPage/RoadmapPage';

function App() {
  // Inicia como 'true' em ambiente de desenvolvimento, e 'false' em produção.
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleLogin = () => { setIsAuthenticated(true); };
  const handleLogout = () => { setIsAuthenticated(false); };
  const REQUIRE_LOGIN = false; // Mude para 'true' se quiser exigir login

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
                isAuthenticated ? (
                  <Navigate to="/dashboard" replace />
                ) : (
                  <LoginPage handleLogin={handleLogin} />
                )
              } 
            />

            {/* ROTAS PROTEGIDAS, mas com interruptor */}
            <Route 
              path="/dashboard/*" // Use /* para aninhar corretamente
              element={
                REQUIRE_LOGIN ? (
                  <ProtectedRoute isAuthenticated={isAuthenticated}>
                    <DashboardLayout />
                  </ProtectedRoute>
                ) : (
                  <DashboardLayout />
                )
              }
            >
              <Route index element={<DashboardOverview />} />
              <Route path="charts" element={<PerformancePage />} />
              <Route path="lab" element={<ModelLabPage />} />
              <Route path="roadmap" element={<RoadmapPage />} />
            </Route>

            {/* ROTAS DOS AGENTES */}
            <Route 
              path="/agents" 
              element={
                REQUIRE_LOGIN ? (
                  <ProtectedRoute isAuthenticated={isAuthenticated}>
                    <AgentsPage />
                  </ProtectedRoute>
                ) : (
                  <AgentsPage />
                )
              } 
            />
            <Route 
              path="/agents/:agentId" 
              element={
                REQUIRE_LOGIN ? (
                  <ProtectedRoute isAuthenticated={isAuthenticated}>
                    <AgentDetailPage />
                  </ProtectedRoute>
                ) : (
                  <AgentDetailPage />
                )
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