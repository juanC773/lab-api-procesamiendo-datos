/**
 * Carga datos con require() para que el bundle de Vercel incluya el JSON
 * (fs + path dinámico suele quedar fuera del artefacto → ENOENT en /var/task).
 */
const raw = require("../data/recommendations.json");

let cachedData = null;
let userMap = null;

function loadRecommendationsArray() {
  if (cachedData) return cachedData;

  if (!Array.isArray(raw)) {
    throw new Error("data/recommendations.json must be an array");
  }

  cachedData = raw;
  return cachedData;
}

function getUserMap() {
  if (userMap) return userMap;

  const arr = loadRecommendationsArray();
  userMap = new Map();
  for (const row of arr) {
    userMap.set(String(row.user_id), row);
  }
  return userMap;
}

module.exports = { loadRecommendationsArray, getUserMap };
