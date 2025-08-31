// server/index.js - VERSÃO DEFINITIVA E COMPLETA

const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();
const { MongoClient, ServerApiVersion } = require('mongodb');

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

// --- ROTAS DA APLICAÇÃO ---

// Rota raiz
app.get('/', (req, res) => {
    res.send('Servidor rodando com MongoDB!');
});

// Rota de autenticação da Riot
app.get('/auth/riot', (req, res) => {
  const clientId = process.env.RIOT_CLIENT_ID || 'ID_AINDA_NAO_CONFIGURADO';
  const redirectUri = process.env.REDIRECT_URI || 'https://valorant-backend.onrender.com/auth/riot/callback';
  const authorizationUri = `https://auth.riotgames.com/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=openid`;
  res.redirect(authorizationUri);
});

// Rota de callback com o "interruptor"
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
    // A lógica para dados reais continua aqui, pronta para o futuro
    res.send("Modo real ativado, mas ainda não implementado.");
  }
});

// ROTA PARA BUSCAR CONTEÚDO (AGENTES) - VERSÃO ENRIQUECIDA COM ÍCONES

app.get('/api/content', async (req, res) => {
  try {
    console.log("-> Rota /api/content acionada!");
    const apiKey = process.env.RIOT_API_KEY;
    if (!apiKey) throw new Error("A chave da API da Riot não foi configurada no .env");

    // URLs das duas APIs que vamos consultar
    const riotApiUrl = `https://br.api.riotgames.com/val/content/v1/contents?locale=pt-BR`;
    const communityApiUrl = `https://valorant-api.com/v1/agents?language=pt-BR&isPlayableCharacter=true`;

    // Fazemos as duas chamadas de API em paralelo para ganhar tempo
    const [riotResponse, communityResponse] = await Promise.all([
      axios.get(riotApiUrl, { headers: { "X-Riot-Token": apiKey } }),
      axios.get(communityApiUrl)
    ]);

    // Pegamos os dados de cada resposta
    const riotCharacters = riotResponse.data.characters;
    const communityAgentsData = communityResponse.data.data;

    // Filtramos os agentes jogáveis da API oficial da Riot
    const playableAgentNames = riotCharacters
      .filter(character => character.name !== "Null UI Data!")
      .map(agent => agent.name.toLowerCase()); // Criamos uma lista de nomes em minúsculas para facilitar a busca

    // Criamos um mapa de ícones a partir da API da comunidade para acesso rápido
    const iconMap = {};
    communityAgentsData.forEach(agent => {
      iconMap[agent.displayName.toLowerCase()] = agent.displayIcon;
    });

    // Combinamos as informações, criando nosso objeto de dados final
    const finalAgentList = communityAgentsData
      .filter(agent => playableAgentNames.includes(agent.displayName.toLowerCase()))
      .map(agent => ({
        id: agent.uuid,
        name: agent.displayName,
        displayIcon: agent.displayIcon
      }));

    console.log(`-> ${finalAgentList.length} agentes enriquecidos com ícones encontrados.`);
    
    res.status(200).json(finalAgentList);

  } catch (error) {
    console.error("-> ERRO ao buscar conteúdo enriquecido:", error.response ? error.response.data : error.message);
    res.status(500).json({ message: "Erro ao buscar dados dos agentes." });
  }
});

// --- INICIALIZAÇÃO DO SERVIDOR ---
// Garante que o servidor só comece a escutar por requisições DEPOIS de conectar ao banco
connectDB().then(() => {
  app.listen(PORT, () => {
      console.log(`Servidor escutando na porta ${PORT}`);
  });
});