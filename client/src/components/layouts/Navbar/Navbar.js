import React from 'react';
import { NavLink } from 'react-router-dom';
import './Navbar.css';

const Navbar = ({ handleLogout }) => {
  return (
    <nav className="main-navbar">
      <div className="nav-brand">Cypher's Edge</div>
      <div className="nav-links">
        <NavLink to="/dashboard">Dashboard</NavLink>
        <NavLink to="/agents">Agentes</NavLink>
      </div>
      <button onClick={handleLogout} className="logout-button-nav">Sair</button>
    </nav>
  );
};

export default Navbar;