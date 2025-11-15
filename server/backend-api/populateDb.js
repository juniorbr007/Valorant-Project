// server/populateDb.js

const mongoose = require('mongoose');
const dotenv = require('dotenv');
// --- A CORREÇÃO ESTÁ NESTA LINHA ---
const { mockMatches } = require('../client/src/shared/mockMatchData');
const Match = require('./models/Match'); // Certifique-se de que o caminho para seu modelo está correto

// Carrega as variáveis de ambiente do arquivo .env
dotenv.config();

const populateDb = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.error("Erro: A variável de ambiente MONGODB_URI não foi definida.");
    process.exit(1);
  }

  try {
    await mongoose.connect(uri);
    console.log("Conectado ao MongoDB com sucesso.");

    console.log("Limpando a coleção 'matches' existente...");
    await Match.deleteMany({});
    console.log("Coleção limpa.");

    console.log(`Populando o banco de dados com ${mockMatches.length} partidas...`);
    await Match.insertMany(mockMatches);
    console.log(`Banco de dados populado com ${mockMatches.length} partidas.`);

  } catch (error) {
    console.error("Ocorreu um erro durante o processo:", error);
  } finally {
    await mongoose.connection.close();
    console.log("Conexão com o MongoDB fechada.");
  }
};

// Executa a função
populateDb();