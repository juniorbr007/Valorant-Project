// server/index.js - VERSÃO CORRETA E FINAL PARA TESTE LOCAL

const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion } = require('mongodb');

const app = express();
const PORT = process.env.PORT || 5000;

// --- CONFIGURAÇÃO DO MONGODB ---
const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

let db;

async function connectDB() {
  try {
    await client.connect();
    db = client.db("valorant-stats"); // Nome do nosso banco de dados
    console.log("Conectado ao MongoDB Atlas com sucesso!");
  } catch (err) {
    console.error("Falha ao conectar ao MongoDB", err);
    process.exit(1);
  }
}
// --- FIM DA CONFIGURAÇÃO ---

app.use(cors());
app.use(express.json());

// --- Nossas Rotas ---

app.get('/auth/riot', (req, res) => {
  const clientId = process.env.RIOT_CLIENT_ID || 'ID_AINDA_NAO_CONFIGURADO';
  const redirectUri = process.env.REDIRECT_URI || 'https://valorant-backend.onrender.com/auth/riot/callback';
  
  const authorizationUri = `https://auth.riotgames.com/authorize?` +
    `client_id=${clientId}&` +
    `redirect_uri=${redirectUri}&` +
    `response_type=code&` +
    `scope=openid`;
  res.redirect(authorizationUri);
});

// ROTA DE CALLBACK (A ROTA IMPORTANTE)
app.get('/auth/riot/callback', async (req, res) => {
  
  console.log("-> Rota de callback acionada!");

  try {
    const mockUserData = {
      puuid: 'PUUID_JOGADOR_SIMULADO_2', // Mudei o PUUID para vermos um novo documento sendo criado
      gameName: 'Jogador',
      tagLine: 'TESTE_LOCAL_SUCESSO'
    };

    console.log("-> Tentando escrever no MongoDB...");

    await db.collection('users').updateOne(
      { puuid: mockUserData.puuid },
      { $set: mockUserData },
      { upsert: true }
    );
    
    console.log(`-> Usuário salvo/atualizado no MongoDB com sucesso!`);
    
    // Para teste local, é melhor enviar uma mensagem do que redirecionar
    res.status(200).send("<h1>Sucesso!</h1><p>Os dados de teste foram salvos no MongoDB. Verifique seu terminal e o Atlas.</p>");

  } catch (error) {
    console.error("-> ERRO no callback:", error);
    res.status(500).send("<h1>Erro!</h1><p>Ocorreu um erro ao salvar os dados. Verifique o console do servidor.</p>");
  }
});

app.get('/', (req, res) => {
    res.send('Servidor rodando com MongoDB!');
});

// Inicia o servidor DEPOIS de conectar ao banco de dados
connectDB().then(() => {
  app.listen(PORT, () => {
      console.log(`Servidor escutando na porta ${PORT}`);
  });
});