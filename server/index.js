// server/index.js - VERSÃO PARA MONGODB ATLAS

const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion } = require('mongodb'); // Importa o driver do MongoDB

const app = express();
const PORT = process.env.PORT || 5000;

// --- CONFIGURAÇÃO DO MONGODB ---
const uri = process.env.MONGODB_URI; // Pega a string de conexão do Render
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

let db; // Variável para segurar a referência do nosso banco de dados

// Função para conectar ao banco de dados
async function connectDB() {
  try {
    await client.connect();
    db = client.db("valorant-stats"); // Define o nome do nosso banco de dados
    console.log("Conectado ao MongoDB Atlas com sucesso!");
  } catch (err) {
    console.error("Falha ao conectar ao MongoDB", err);
    process.exit(1); // Encerra o servidor se não conseguir conectar ao DB
  }
}
// --- FIM DA CONFIGURAÇÃO ---


app.use(cors());
app.use(express.json());

// --- Nossas Rotas ---

app.get('/auth/riot', (req, res) => {
  // Esta rota continua exatamente a mesma
  const clientId = process.env.RIOT_CLIENT_ID || 'ID_AINDA_NAO_CONFIGURADO';
  const redirectUri = process.env.REDIRECT_URI || 'https://valorant-backend.onrender.com/auth/riot/callback';

  const authorizationUri = `https://auth.riotgames.com/authorize?` +
    `client_id=${clientId}&` +
    `redirect_uri=${redirectUri}&` +
    `response_type=code&` +
    `scope=openid`;
  res.redirect(authorizationUri);
});

// ROTA DE CALLBACK ATUALIZADA PARA MONGODB
app.get('/auth/riot/callback', async (req, res) => {
  console.log("-> Rota de callback acionada!");
  try {
    const mockUserData = {
      puuid: 'PUUID_DO_JOGADOR_SIMULADO',
      gameName: 'Jogador',
      tagLine: 'MONGO' // Mudado para sabermos que veio do novo código
    };
    console.log("-> Tentando escrever no MongoDB..."); 

    // Salva ou atualiza os dados do usuário na coleção 'users'
    // A opção 'upsert: true' faz com que, se o documento não existir, ele seja criado.
    await db.collection('users').updateOne(
      { puuid: mockUserData.puuid }, // Filtro: procure por este puuid
      { $set: mockUserData },        // Dados: defina/atualize os dados com este objeto
      { upsert: true }                // Opção: se não encontrar, crie.
    );

    console.log(`Usuário ${mockUserData.gameName} salvo/atualizado no MongoDB.`);

    res.redirect('https://valorant-frontend.onrender.com/dashboard');

  } catch (error) {
    console.error("Erro no callback:", error);
    res.redirect('https://valorant-frontend.onrender.com/?error=auth_failed');
  }
});

app.get('/', (req, res) => {
    res.send('Servidor rodando no Render com MongoDB!');
});

// Inicia o servidor DEPOIS de conectar ao banco de dados
connectDB().then(() => {
  app.listen(PORT, () => {
      console.log(`Servidor escutando na porta ${PORT}`);
  });
});