/**
 * Importa as funções necessárias do Firebase.
 * Usaremos o onRequest para "envelopar" nosso servidor Express.
 */
const { onRequest } = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");

// Importa nossas bibliotecas do servidor
const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Importa e configura o Firebase Admin para conectar ao banco de dados
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// Cria uma referência ao nosso banco de dados (Firestore)
const db = admin.firestore();

// --- Inicia a criação do nosso servidor Express ---
const app = express();

// Middlewares: Funções que preparam nosso servidor para receber requisições
app.use(cors({ origin: true })); // Permite que nosso frontend acesse o backend
app.use(express.json());       // Permite que o servidor entenda JSON

// --- Nossas Rotas (Endpoints da API) ---

// ROTA 1: Redireciona para o login da Riot
app.get('/auth/riot', (req, res) => {
  const authorizationUri = `https://auth.riotgames.com/authorize?` +
    `client_id=${process.env.RIOT_CLIENT_ID}&` +
    `redirect_uri=${process.env.REDIRECT_URI}&` +
    `response_type=code&` +
    `scope=openid`;

  res.redirect(authorizationUri);
});

// ROTA 2: Recebe o retorno da Riot após o login
app.get('/auth/riot/callback', (req, res) => {
  const { code } = req.query;

  if (code) {
    logger.info("Código de autorização recebido:", code);
    res.send('Login quase completo! Recebemos o código. Volte para o servidor para ver o próximo passo.');
  } else {
    res.status(400).send('Erro: Nenhum código de autorização foi fornecido.');
  }
});

// ROTA DE TESTE PARA O BANCO DE DADOS
app.get('/test-db', async (req, res) => {
  try {
    const docRef = await db.collection('tests').add({
      name: 'Teste de Conexão v2',
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });
    logger.info("Document written with ID: ", docRef.id);
    res.status(200).send(`Documento de teste criado com sucesso! ID: ${docRef.id}`);
  } catch (error) {
    logger.error("Error adding document: ", error);
    res.status(500).send('Erro ao criar documento de teste.');
  }
});

// Rota raiz de teste
app.get('/', (req, res) => {
  res.send('Olá! Nosso servidor Valorant está no ar via Cloud Function v2!');
});

// --- Fim das Rotas ---

/**
 * Exporta nosso aplicativo Express completo como uma única Cloud Function.
 * O nome da função será "api".
 * Toda requisição para a nossa função (ex: .../api/test-db) será gerenciada pelo Express.
 */
exports.api = onRequest(app);