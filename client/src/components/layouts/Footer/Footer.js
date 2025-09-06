import React from 'react';
import './Footer.css';

const Footer = () => {
  // Substitua 'Nome do Seu App' pelo nome que você escolheu
  const appName = 'Cyphers Edge'; 

  return (
    <footer className="app-footer">
      <p>
        {appName} não é endossado pela Riot Games e não reflete as visões ou opiniões da Riot Games ou de qualquer pessoa oficialmente envolvida na produção ou gerenciamento das propriedades da Riot Games. Riot Games e todas as propriedades associadas são marcas comerciais ou marcas registradas da Riot Games, Inc.
      </p>
    </footer>
  );
};

export default Footer;