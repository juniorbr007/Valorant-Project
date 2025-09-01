import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import './DashboardLayout.css';

const DashboardLayout = () => {
  return (
    <div className="dashboard-layout">
      <nav className="dashboard-nav">
        <NavLink to="/dashboard" end>Visão Geral</NavLink>
        <NavLink to="/dashboard/charts">Gráficos de Performance</NavLink>
        <NavLink to="/dashboard/lab">Laboratório de Modelos</NavLink>
        <NavLink to="/dashboard/roadmap">Roteiro do Projeto</NavLink>
        {/* No futuro, podemos adicionar mais links aqui */}
      </nav>
      <div className="dashboard-content">
        {/* As páginas aninhadas serão renderizadas aqui */}
        <Outlet />
      </div>
    </div>
  );
};

export default DashboardLayout;