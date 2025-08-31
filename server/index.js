// server/index.js - VERSÃO PARA O RENDER

const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000; // Render usa a variável de ambiente PORT

// Middlewares
app.use(cors());
app.use(express.json());

// --- Nossas Rotas ---

// Rota de redirecionamento para a Riot
app.get('/auth/riot', (req, res) => {
  // Esta rota continua a mesma, mas precisaremos das chaves no futuro
  const clientId = process.env.RIOT_CLIENT_ID || 'ID_AINDA_NAO_CONFIGURADO';
  const redirectUri = process.env.REDIRECT_URI || 'http://localhost:5000/auth/riot/callback';

  const authorizationUri = `https://auth.riotgames.com/authorize?` +
    `client_id=${clientId}&` +
    `redirect_uri=${redirectUri}&` +
    `response_type=code&` +
    `scope=openid`;
  res.redirect(authorizationUri);
});

// Rota de callback
app.get('/auth/riot/callback', (req, res) => {
    res.send('Callback do backend funcionando!');
});

// Rota raiz de teste
app.get('/', (req, res) => {
    res.send('Servidor rodando no Render!');
});

// Inicia o servidor
app.listen(PORT, () => {
    console.log(`Servidor escutando na porta ${PORT}`);
});