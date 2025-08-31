import React from 'react';
import { Navigate } from 'react-router-dom';

// Este componente recebe o estado de autenticação e a página que ele deve renderizar (children)
const ProtectedRoute = ({ isAuthenticated, children }) => {
  if (!isAuthenticated) {
    // Se o usuário NÃO estiver autenticado, redireciona para a página de login
    return <Navigate to="/" replace />;
  }

  // Se estiver autenticado, renderiza a página solicitada (ex: o Dashboard)
  return children;
};

export default ProtectedRoute;