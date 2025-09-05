// server/index.js - VERSÃO DEFINITIVA E COMPLETA

const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();
const { MongoClient, ServerApiVersion } = require('mongodb');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Inicialização do Express
const app = express();
const PORT = process.env.PORT || 5000;

// --- CONFIGURAÇÃO COMPLETA DO MONGODB ---
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
    db = client.db("valorant-stats");
    console.log("Conectado ao MongoDB Atlas com sucesso!");
  } catch (err) {
    console.error("Falha ao conectar ao MongoDB", err);
    process.exit(1);
  }
}
// --- FIM DA CONFIGURAÇÃO ---

// Middlewares
app.use(cors());
app.use(express.json());

// --- ROTAS GERAIS E DE AUTENTICAÇÃO ---

app.get('/', (req, res) => {
    res.send('Servidor rodando com MongoDB!');
});

app.get('/auth/riot', (req, res) => {
  const clientId = process.env.RIOT_CLIENT_ID || 'ID_AINDA_NAO_CONFIGURADO';
  const redirectUri = process.env.REDIRECT_URI || 'https://valorant-backend.onrender.com/auth/riot/callback';
  const authorizationUri = `https://auth.riotgames.com/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=openid`;
  res.redirect(authorizationUri);
});

app.get('/auth/riot/callback', async (req, res) => {
  console.log("-> Rota de callback acionada!");
  if (process.env.USE_MOCK_DATA === 'true') {
    console.log("-> MODO FICTÍCIO ATIVADO. Salvando dados de teste.");
    try {
      const mockUserData = { puuid: `PUUID_FICTICIO_${Date.now()}`, gameName: 'Jogador Fictício', tagLine: 'MOCK' };
      await db.collection('users').updateOne({ puuid: mockUserData.puuid }, { $set: mockUserData }, { upsert: true });
      console.log(`-> Usuário fictício salvo com sucesso!`);
      res.redirect('https://valorant-frontend.onrender.com/dashboard');
    } catch (error) {
      console.error("-> ERRO ao salvar dados fictícios:", error);
      res.redirect('https://valorant-frontend.com/?error=mock_db_failed');
    }
  } else {
    res.send("Modo real ativado, mas ainda não implementado.");
  }
});

// --- ROTAS PARA DADOS FICTÍCIOS (MOCKS) ---

app.get('/api/match-history', (req, res) => {
  try {
    const historyPath = path.join(__dirname, 'mocks', 'match-history.json');
    if (fs.existsSync(historyPath)) {
      const historyData = JSON.parse(fs.readFileSync(historyPath, 'utf-8'));
      res.status(200).json(historyData);
    } else {
      res.status(404).json({ message: "Arquivo de histórico não encontrado." });
    }
  } catch (error) {
    console.error("ERRO ao buscar histórico de partidas:", error);
    res.status(500).json({ message: "Erro interno do servidor." });
  }
});

app.get('/api/detailed-match/:matchId', (req, res) => {
  try {
    const { matchId } = req.params;
    if (!/^[a-zA-Z0-9-]+$/.test(matchId)) {
      return res.status(400).json({ message: "ID de partida inválido." });
    }
    const filePath = path.join(__dirname, 'mocks', `${matchId}.json`);
    if (fs.existsSync(filePath)) {
      const matchData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      console.log(`-> Enviando dados para a partida: ${matchId}`);
      res.status(200).json(matchData);
    } else {
      console.log(`-> Partida não encontrada: ${matchId}`);
      res.status(404).json({ message: "Partida não encontrada." });
    }
  } catch (error) {
    console.error(`-> ERRO ao buscar a partida ${req.params.matchId}:`, error);
    res.status(500).json({ message: "Erro interno do servidor." });
  }
});


// --- ROTAS DE DADOS E MODELOS DE ML ---

app.get('/api/run-clustering', (req, res) => {
  console.log("-> Acionando o script de clustering em Python...");
  const pythonProcess = spawn('python', ['cluster_model.py']);
  pythonProcess.stdout.on('data', (data) => console.log(`[Python Script]: ${data}`));
  pythonProcess.stderr.on('data', (data) => console.error(`[Python Script ERROR]: ${data}`));
  pythonProcess.on('close', (code) => {
    if (code === 0) {
      console.log("-> Script de clustering finalizado com sucesso.");
      res.status(200).send("Processo de clustering concluído com sucesso!");
    } else {
      console.log(`-> Script de clustering finalizado com erro, código: ${code}`);
      res.status(500).send("Ocorreu um erro durante o processo de clustering.");
    }
  });
});

app.get('/api/content', async (req, res) => {
  try {
    console.log("-> Rota /api/content acionada!");
    const apiKey = process.env.RIOT_API_KEY;
    if (!apiKey) throw new Error("A chave da API da Riot não foi configurada no .env");
    const riotApiUrl = `https://br.api.riotgames.com/val/content/v1/contents?locale=pt-BR`;
    const communityApiUrl = `https://valorant-api.com/v1/agents?language=pt-BR&isPlayableCharacter=true`;
    const [riotResponse, communityResponse] = await Promise.all([
      axios.get(riotApiUrl, { headers: { "X-Riot-Token": apiKey } }),
      axios.get(communityApiUrl)
    ]);
    const riotCharacters = riotResponse.data.characters;
    const communityAgentsData = communityResponse.data.data;
    const playableAgentNames = riotCharacters
      .filter(character => character.name !== "Null UI Data!")
      .map(agent => agent.name.toLowerCase());
    const finalAgentList = communityAgentsData
      .filter(agent => playableAgentNames.includes(agent.displayName.toLowerCase()))
      .map(agent => ({ id: agent.uuid, name: agent.displayName, displayIcon: agent.displayIcon }));
    console.log(`-> ${finalAgentList.length} agentes enriquecidos com ícones encontrados.`);
    res.status(200).json(finalAgentList);
  } catch (error) {
    console.error("-> ERRO ao buscar conteúdo enriquecido:", error.response ? error.response.data : error.message);
    res.status(500).json({ message: "Erro ao buscar dados dos agentes." });
  }
});

app.get('/api/seed-database', async (req, res) => {
  try {
    console.log("-> Semeando o banco de dados com dados fictícios...");
    const { mockMatches } = require('../client/src/shared/mockMatchData');
    const matchesCollection = db.collection('matches');
    await matchesCollection.deleteMany({});
    const result = await matchesCollection.insertMany(mockMatches);
    console.log(`-> ${result.insertedCount} partidas inseridas com sucesso!`);
    res.status(200).send(`${result.insertedCount} partidas fictícias foram inseridas no banco de dados com sucesso!`);
  } catch (error) {
    console.error("-> ERRO ao semear o banco de dados:", error);
    res.status(500).send("Ocorreu um erro ao semear o banco de dados.");
  }
});

app.get('/api/matches', async (req, res) => {
  try {
    const matchesCollection = db.collection('matches');
    const allMatches = await matchesCollection.find({}).toArray();
    if (allMatches.length === 0) return res.status(404).json({ message: "Nenhuma partida encontrada no banco de dados." });
    console.log(`-> Enviando ${allMatches.length} partidas do MongoDB.`);
    res.status(200).json(allMatches);
  } catch (error) {
    console.error("-> ERRO ao buscar partidas do DB:", error);
    res.status(500).json({ message: "Ocorreu um erro ao buscar as partidas." });
  }
});

app.get('/api/run-classifier', (req, res) => {
  console.log("-> Acionando o script de classificação em Python...");
  const pythonProcess = spawn('python', ['classifier_model.py']);
  let resultData = '';
  pythonProcess.stdout.on('data', (data) => resultData += data.toString());
  pythonProcess.stderr.on('data', (data) => console.error(`[Python Script ERROR]: ${data}`));
  pythonProcess.on('close', (code) => {
    if (code === 0) {
      console.log("-> Script de classificação finalizado com sucesso.");
      res.status(200).json(JSON.parse(resultData));
    } else {
      console.log(`-> Script de classificação finalizado com erro, código: ${code}`);
      res.status(500).send("Ocorreu um erro durante o processo de classificação.");
    }
  });
});

app.post('/api/predict', (req, res) => {
  console.log("-> Recebida requisição de previsão com os dados:", req.body);
  const dataString = JSON.stringify(req.body);
  const pythonProcess = spawn('python', ['predict_model.py', dataString]);
  let resultData = '';
  pythonProcess.stdout.on('data', (data) => resultData += data.toString());
  pythonProcess.stderr.on('data', (data) => console.error(`[Python Predict ERROR]: ${data}`));
  pythonProcess.on('close', (code) => {
    if (code === 0) {
      console.log("-> Previsão realizada com sucesso:", resultData);
      res.status(200).json(JSON.parse(resultData));
    } else {
      res.status(500).send("Erro durante a previsão.");
    }
  });
});


// --- INICIALIZAÇÃO DO SERVIDOR ---
connectDB().then(() => {
  app.listen(PORT, () => {
      console.log(`Servidor escutando na porta ${PORT}`);
  });
});

