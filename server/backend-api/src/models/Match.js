// server/models/Match.js

const mongoose = require('mongoose');

// Primeiro, definimos a "planta baixa" para o objeto aninhado 'playerStats'
const PlayerStatsSchema = new mongoose.Schema({
  agent: { type: String, required: true },
  role: { type: String, required: true },
  score: { type: Number, required: true },
  kills: { type: Number, required: true },
  deaths: { type: Number, required: true },
  assists: { type: Number, required: true },
  headshotPercentage: { type: Number, required: true },
  firstKills: { type: Number, required: true }
});

// Agora, definimos a "planta baixa" principal para o documento da partida
const MatchSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true }, // O ID da nossa mock data
  map: { type: String, required: true },
  result: { type: String, required: true },
  date: { type: String, required: true },
  playerStats: { type: PlayerStatsSchema, required: true }
});

// Finalmente, criamos e exportamos o "Molde" (Modelo)
// O Mongoose irá automaticamente criar/usar uma coleção chamada "matches" (plural, minúsculo)
module.exports = mongoose.model('Match', MatchSchema);