// server/index.js - VERSÃO DEFINITIVA E COMPLETA

const express = require('express');
const cors = require('cors');
const axios = require('axios'); // Garantimos que o axios está importado
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
app.use(express.json({ limit: '10mb' }));

app.get('/', (req, res) => {
  res.send('Servidor rodando com MongoDB!');
});

// =================================================================
// --- 5. FUNÇÃO AUXILIAR GLOBAL PARA EXECUTAR SCRIPTS PYTHON ---
// =================================================================
const runScript = (scriptName, args = []) => {
 return new Promise((resolve, reject) => {
  const pythonProcess = spawn('python', [scriptName, ...args]);
  let stdout = '';
  let stderr = '';
  
  pythonProcess.stdout.on('data', (data) => { stdout += data.toString(); });
  pythonProcess.stderr.on('data', (data) => { stderr += data.toString(); });
  
  pythonProcess.on('close', (code) => {
   console.log(`[${scriptName}] finalizado com código: ${code}`);
   if (stderr) {
    console.log(`[${scriptName} LOG]:\n${stderr}`);
   }
   if (code === 0) {
    resolve(stdout);
   } else {
    reject(new Error(`Script ${scriptName} falhou com código ${code}. Veja o log acima.`));
   }
  });

  pythonProcess.on('error', (err) => {
   console.error(`Falha ao iniciar o script ${scriptName}:`, err);
   reject(err);
  });
 });
};

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
  console.log("-> Rota /api/content acionada! (Versão Simplificada)");
  const communityApiUrl = `https://valorant-api.com/v1/agents?language=pt-BR&isPlayableCharacter=true`;
  const response = await axios.get(communityApiUrl);
  const finalAgentList = response.data.data.map(agent => ({ 
   id: agent.uuid, 
   name: agent.displayName, 
   displayIcon: agent.displayIcon 
  }));

  console.log(`-> ${finalAgentList.length} agentes encontrados.`);
  res.status(200).json(finalAgentList);

 } catch (error) {
  console.error("-> ERRO ao buscar dados da valorant-api.com:", error.message);
  res.status(500).json({ message: "Erro ao buscar dados dos agentes." });
 }
});

app.get('/api/seed-database', async (req, res) => {
 try {
  console.log("-> Semeando o banco de dados com dados fictícios...");
  const mockDataPath = path.join(__dirname, '..', 'client', 'src', 'shared', 'mockMatchData.js');
  const { mockMatches } = require(mockDataPath); 

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

// --- ROTA PARA EXECUTAR A PIPELINE COMPLETA DE CLASSIFICAÇÃO DO LOL ---
// --- ROTA DO CLASSIFICADOR CORRIGIDA (CHAMA OS SCRIPTS SEPARADAMENTE) ---
app.get('/api/lol/run-classifier/:puuid/:gameMode', async (req, res) => {
    const { puuid, gameMode } = req.params;
    if (!puuid || !gameMode) {
        return res.status(400).json({ message: "PUUID e Modo de Jogo são necessários." });
    }

    console.log(`-> Acionando pipeline de ML em duas etapas para PUUID: ${puuid}, Modo: ${gameMode}`);
    try {
        // Etapa 1: Executa o data_miner.py para garantir que o CSV está atualizado
        console.log("--> Etapa 1: Executando data_miner.py...");
        await runScript('data_miner.py', [puuid]);
        console.log("--> Etapa 1 Concluída.");

        // Etapa 2: Executa o lol_classifier_model.py com o modo de jogo correto
        console.log(`--> Etapa 2: Executando lol_classifier_model.py com modo ${gameMode}...`);
        const scriptOutput = await runScript('lol_classifier_model.py', [gameMode]);
        
        console.log("--> Pipeline de ML concluída com sucesso.");
        // O scriptOutput é o JSON dos resultados, que enviamos de volta ao frontend
        res.status(200).json(JSON.parse(scriptOutput));

    } catch (error) {
        console.error("-> ERRO na pipeline de ML em duas etapas:", error.message);
        res.status(500).json({ message: "Ocorreu um erro durante a execução da pipeline de ML." });
    }
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

// --- ROTA PARA BUSCAR DADOS DE JOGADOR DO LOL ---
app.get('/api/lol/player/:gameName/:tagLine', async (req, res) => {
 const { gameName, tagLine } = req.params;
 const apiKey = process.env.RIOT_API_KEY;

 if (!apiKey) {
  return res.status(500).json({ message: "A chave da API da Riot não está configurada no servidor." });
 }

 const accountUrl = `https://americas.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${gameName}/${tagLine}`;

 try {
  console.log(`Buscando dados do LoL para: ${gameName}#${tagLine}`);
  const response = await axios.get(accountUrl, {
   headers: { "X-Riot-Token": apiKey }
  });
  console.log("Dados da conta encontrados:", response.data);
  res.json(response.data);
 } catch (error) {
  const status = error.response?.status || 500;
  const message = error.response?.data?.status?.message || "Erro ao se comunicar com a API da Riot.";
  console.error(`ERRO ${status}:`, message);
  res.status(status).json({ message });
 }
});

// --- ROTA DE HISTÓRICO DE PARTIDAS (VERSÃO LENTA E SEGURA CONTRA RATE LIMIT) ---
app.get('/api/lol/matches/:puuid', async (req, res) => {
    const { puuid } = req.params;
    const apiKey = process.env.RIOT_API_KEY;
    if (!apiKey) return res.status(500).json({ message: "Chave da API não configurada." });

    const matchIdsUrl = `https://americas.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids`;
    const matchesCollection = db.collection("lol_raw_matches");

    try {
        const matchIdsResponse = await axios.get(matchIdsUrl, { headers: { "X-Riot-Token": apiKey } });
        const recentMatchIds = matchIdsResponse.data.slice(0, 20);
        console.log(`Riot retornou ${recentMatchIds.length} IDs de partida recentes.`);

        const cachedMatches = await matchesCollection.find({ "metadata.matchId": { $in: recentMatchIds } }).toArray();
        const cachedMatchIds = cachedMatches.map(match => match.metadata.matchId);
        console.log(`Encontradas ${cachedMatches.length} partidas no cache.`);

        const missingMatchIds = recentMatchIds.filter(id => !cachedMatchIds.includes(id));
        console.log(`Precisamos buscar ${missingMatchIds.length} novas partidas da API.`);

        let newCompleteMatches = [];
        if (missingMatchIds.length > 0) {
            console.log('Iniciando busca em fila LENTA para evitar Rate Limit...');
            for (const matchId of missingMatchIds) {
                try {
                    const matchDetailsUrl = `https://americas.api.riotgames.com/lol/match/v5/matches/${matchId}`;
                    const timelineUrl = `https://americas.api.riotgames.com/lol/match/v5/matches/${matchId}/timeline`;

                    // Fazemos as chamadas uma de cada vez para não sobrecarregar
                    console.log(`Buscando detalhes para ${matchId}...`);
                    const matchDetailsResponse = await axios.get(matchDetailsUrl, { headers: { "X-Riot-Token": apiKey } });
                    
                    // PAUSA CRÍTICA DE 1.2 SEGUNDOS ANTES DA PRÓXIMA CHAMADA
                    await new Promise(resolve => setTimeout(resolve, 1200)); 
                    
                    console.log(`Buscando timeline para ${matchId}...`);
                    const timelineResponse = await axios.get(timelineUrl, { headers: { "X-Riot-Token": apiKey } });

                    const completeMatchData = { ...matchDetailsResponse.data, timeline: timelineResponse.data };
                    newCompleteMatches.push(completeMatchData);

                } catch (loopError) {
                    console.error(`Falha ao buscar dados completos para a partida ${matchId}:`, loopError.response ? `Status ${loopError.response.status}` : loopError.message);
                }
                 // PAUSA ADICIONAL DE 1.2 SEGUNDOS ANTES DE IR PARA A PRÓXIMA PARTIDA
                 await new Promise(resolve => setTimeout(resolve, 1200));
            }
            console.log('Busca em fila concluída.');
            
            if (newCompleteMatches.length > 0) {
                await matchesCollection.insertMany(newCompleteMatches);
                console.log(`-> ${newCompleteMatches.length} novas partidas foram salvas no MongoDB com a timeline.`);
            }
        }

        const allMatchDetails = [...cachedMatches, ...newCompleteMatches];
        const enrichedMatchHistory = allMatchDetails.map(matchData => {
            const p = matchData.info.participants.find(p => p.puuid === puuid);
            if (!p) return null;
            return {
                matchId: matchData.metadata.matchId,
                gameMode: matchData.info.gameMode,
                win: p.win,
                championName: p.championName,
                kills: p.kills, deaths: p.deaths, assists: p.assists,
            };
        }).filter(Boolean);

        const finalSortedList = recentMatchIds
            .map(id => enrichedMatchHistory.find(match => match.matchId === id))
            .filter(Boolean);

        res.json(finalSortedList);

    } catch (error) {
        res.status(error.response?.status || 500).json({ message: "Erro geral ao buscar histórico de partidas." });
    }
});

// --- ROTA PARA BUSCAR DETALHES DE UMA PARTIDA ESPECÍFICA DO LOL ---
app.get('/api/lol/match/:matchId', async (req, res) => {
 const { matchId } = req.params;
 const apiKey = process.env.RIOT_API_KEY;

 if (!apiKey) {
  return res.status(500).json({ message: "A chave da API da Riot não está configurada no servidor." });
 }

 const matchDetailsUrl = `https://americas.api.riotgames.com/lol/match/v5/matches/${matchId}`;

 try {
  console.log(`Buscando detalhes da partida: ${matchId}`);
  const response = await axios.get(matchDetailsUrl, { headers: { "X-Riot-Token": apiKey } });
  console.log("Detalhes da partida encontrados com sucesso.");
  res.json(response.data);
 } catch (error) {
  const status = error.response?.status || 500;
  const message = error.response?.data?.status?.message || "Erro ao buscar detalhes da partida.";
  console.error(`ERRO ${status}:`, message);
  res.status(status).json({ message });
 }
});


// --- ROTA PARA SALVAR DADOS BRUTOS DE UMA PARTIDA DO LOL ---
app.post('/api/lol/save-match', async (req, res) => {
 try {
  const matchData = req.body;
  if (!matchData?.metadata?.matchId) {
   return res.status(400).json({ message: "Dados da partida inválidos ou ausentes." });
  }
  const matchId = matchData.metadata.matchId;
  const collection = db.collection("lol_raw_matches");
  console.log(`Recebido pedido para salvar a partida: ${matchId}`);
  const result = await collection.updateOne(
   { "metadata.matchId": matchId },
   { $set: matchData },
   { upsert: true }
  );
  if (result.upsertedCount > 0) {
   console.log(`-> Partida ${matchId} inserida com sucesso!`);
   res.status(201).json({ message: `Partida ${matchId} salva com sucesso!` });
  } else {
   console.log(`-> Partida ${matchId} já existia e foi atualizada.`);
   res.status(200).json({ message: `Partida ${matchId} atualizada.` });
  }
 } catch (error) {
  console.error("ERRO ao salvar a partida no MongoDB:", error);
  res.status(500).json({ message: "Erro interno ao salvar a partida." });
 }
});

// --- ROTA PARA SALVAR MÚLTIPLAS PARTIDAS DE UMA VEZ ---
app.post('/api/lol/save-matches', async (req, res) => {
    try {
        const matches = req.body;
        // Filtra qualquer item inválido que o frontend possa enviar
        const validMatches = Array.isArray(matches) ? matches.filter(match => match && match.metadata && match.metadata.matchId) : [];

        if (validMatches.length === 0) {
            return res.status(400).json({ message: "Nenhum dado de partida válido fornecido." });
        }

        const collection = db.collection("lol_raw_matches");
        console.log(`Recebido pedido para salvar ${validMatches.length} partidas válidas.`);

        const operations = validMatches.map(matchData => ({
            updateOne: {
                filter: { "metadata.matchId": matchData.metadata.matchId },
                update: { $set: matchData },
                upsert: true,
            },
        }));
        
        const result = await collection.bulkWrite(operations);
        console.log(`-> ${result.upsertedCount} novas partidas inseridas, ${result.modifiedCount} atualizadas.`);
        res.status(200).json({ message: "Operação concluída!" });

    } catch (error) {
        console.error("ERRO ao salvar partidas em lote:", error);
        res.status(500).json({ message: "Erro interno ao salvar partidas." });
    }
});

// --- ROTA PARA EXECUTAR O CLASSIFICADOR COM DADOS DO LOL ---
// --- ROTA DO CLASSIFICADOR CORRIGIDA ---
// Substitua a sua rota /api/lol/run-classifier/:puuid/:gameMode por esta
app.get('/api/lol/run-classifier/:puuid/:gameMode', async (req, res) => {
    const { puuid, gameMode } = req.params;
    if (!puuid || !gameMode) {
        return res.status(400).json({ message: "PUUID e Modo de Jogo são necessários." });
    }

    console.log(`-> Acionando pipeline de ML em duas etapas para PUUID: ${puuid}, Modo: ${gameMode}`);
    try {
        // Etapa 1: Executa o data_miner.py para garantir que o CSV está atualizado
        console.log("--> Etapa 1: Executando data_miner.py...");
        await runScript('data_miner.py', [puuid]);
        console.log("--> Etapa 1 Concluída.");

        // Etapa 2: Executa o lol_classifier_model.py com o modo de jogo correto
        console.log(`--> Etapa 2: Executando lol_classifier_model.py com modo ${gameMode}...`);
        const scriptOutput = await runScript('lol_classifier_model.py', [gameMode]);
        
        console.log("--> Pipeline de ML concluída com sucesso.");
        res.status(200).json(JSON.parse(scriptOutput));

    } catch (error) {
        console.error("-> ERRO na pipeline de ML em duas etapas:", error.message);
        res.status(500).json({ message: "Ocorreu um erro durante a execução da pipeline de ML." });
    }
});

// --- ROTA PARA SERVIR OS DADOS DE TREINAMENTO (CSV) COMO JSON ---
app.get('/api/lol/training-data', (req, res) => {
 const csvPath = path.join(__dirname, 'lol_player_stats.csv');
 try {
  if (!fs.existsSync(csvPath)) {
   return res.status(404).json({ message: "Arquivo CSV não encontrado. Rode o data_miner.py primeiro." });
  }
  const fileContent = fs.readFileSync(csvPath, 'utf-8');
  const rows = fileContent.split('\n').filter(Boolean);
  const headers = rows.shift().split(',');
  
  const jsonData = rows.map(row => {
   const values = row.split(',');
   const entry = {};
   headers.forEach((header, index) => {
    entry[header] = isNaN(values[index]) ? values[index] : Number(values[index]);
   });
   return entry;
  });
  console.log(`-> Enviando ${jsonData.length} linhas de dados de treinamento.`);
  res.status(200).json(jsonData);
 } catch (error) {
  console.error("ERRO ao ler o arquivo CSV:", error);
  res.status(500).json({ message: "Erro interno ao processar os dados de treinamento." });
 }
});

// --- ROTA PARA ANÁLISE DE IMPORTÂNCIA DAS FEATURES ---
app.get('/api/lol/feature-importance/:puuid', async (req, res) => {
 const { puuid } = req.params;
 if (!puuid) return res.status(400).json({ message: "PUUID é necessário." });

 console.log(`-> Acionando análise de features para o PUUID: ${puuid}`);
 try {
  await runScript('data_miner.py', [puuid]);
  const analysisResultJson = await runScript('feature_analysis.py');
  const analysisResult = JSON.parse(analysisResultJson);

  if (analysisResult.error) {
   return res.status(400).json({ message: analysisResult.error });
  }
  const imagePath = path.join(__dirname, analysisResult.image_path);
  res.sendFile(imagePath, (err) => {
   if (err) {
    console.error("Erro ao enviar a imagem:", err);
    res.status(500).send("Não foi possível enviar a imagem de análise.");
   }
   try {
    fs.unlinkSync(imagePath);
   } catch (unlinkErr) {
    console.error("Erro ao deletar a imagem temporária:", unlinkErr);
   }
  });
 } catch (error) {
  console.error("-> ERRO na pipeline de análise de features:", error.message);
  res.status(500).json({ message: "Ocorreu um erro durante a análise." });
 }
});

// --- ROTA PARA ANÁLISE ESTATÍSTICA (GRÁFICO DE NEMENYI) ---
// Adicione esta rota ao seu index.js
// --- ROTA PARA ANÁLISE ESTATÍSTICA (LENDO DE ARQUIVO) ---
app.get('/api/lol/statistical-analysis', async (req, res) => {
    console.log(`-> Acionando análise estatística (Nemenyi)...`);
    try {
        // Roda o script, que agora salva o resultado em um arquivo.
        await runScript('statistical_analysis.py');

        // --- MUDANÇA PRINCIPAL: Lê o resultado do arquivo em vez do stdout ---
        const resultFilePath = path.join(__dirname, 'statistical_analysis_results.json');
        const analysisResultJson = fs.readFileSync(resultFilePath, 'utf-8');
        const analysisResult = JSON.parse(analysisResultJson);

        // Limpa o arquivo de resultados para a próxima execução
        fs.unlinkSync(resultFilePath);

        if (analysisResult.error) {
            console.error("Erro retornado pelo script de análise:", analysisResult.error);
            return res.status(400).json({ message: analysisResult.error });
        }

        const imagePath = path.join(__dirname, analysisResult.image_path);
        
        res.sendFile(imagePath, (err) => {
            if (err) {
                console.error("Erro ao enviar a imagem do gráfico:", err);
                res.status(500).send("Não foi possível enviar a imagem de análise.");
            }
            // Deleta a imagem temporária
            try {
                fs.unlinkSync(imagePath);
                console.log(`-> Imagem temporária '${analysisResult.image_path}' deletada.`);
            } catch (unlinkErr) {
                // Não faz nada se o arquivo já foi deletado
            }
        });

    } catch (error) {
        console.error("-> ERRO na pipeline de análise estatística:", error.message);
        res.status(500).json({ message: "Ocorreu um erro durante a execução da análise." });
    }
});

// --- INICIALIZAÇÃO DO SERVIDOR ---
connectDB().then(() => {
 app.listen(PORT, () => {
   console.log(`Servidor escutando na porta ${PORT}`);
 });
});