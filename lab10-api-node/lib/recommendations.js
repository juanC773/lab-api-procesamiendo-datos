/**
 * Carga con require() para que Vercel incluya el JSON en el bundle.
 * Optimización: normalizar una vez, cachear el string JSON de la lista completa
 * y por usuario (evita JSON.stringify repetido en cada request).
 */
const raw = require("../data/recommendations.json");

const JSON_UTF8 = "application/json; charset=utf-8";

/** Redondea scores largos → menos bytes y stringify más barato */
function roundScore(n) {
  if (typeof n !== "number" || Number.isNaN(n)) return n;
  return Math.round(n * 10000) / 10000;
}

function normalizeUser(row) {
  return {
    user_id: row.user_id,
    cluster: row.cluster,
    recommendations: row.recommendations.map((r) => ({
      movie_id: r.movie_id,
      movie_title: r.movie_title,
      score: roundScore(r.score)
    }))
  };
}

let prepared = false;
let normalized = null;
let fullListJson = null;
let userMap = null;
/** @type {Map<string, string>} */
const userJsonCache = new Map();

function ensurePrepared() {
  if (prepared) return;

  if (!Array.isArray(raw)) {
    throw new Error("data/recommendations.json must be an array");
  }

  normalized = raw.map(normalizeUser);
  fullListJson = JSON.stringify(normalized);

  userMap = new Map();
  for (const row of normalized) {
    userMap.set(String(row.user_id), row);
  }

  prepared = true;
}

/** Lista completa ya como string (para GET /recommendations sin re-stringify) */
function getFullListJsonString() {
  ensurePrepared();
  return fullListJson;
}

/** Un usuario como string JSON o null si no existe */
function getUserJsonString(userId) {
  ensurePrepared();
  const key = String(userId);
  let body = userJsonCache.get(key);
  if (body !== undefined) return body;

  const row = userMap.get(key);
  if (!row) return null;

  body = JSON.stringify(row);
  userJsonCache.set(key, body);
  return body;
}

function loadRecommendationsArray() {
  ensurePrepared();
  return normalized;
}

function getUserMap() {
  ensurePrepared();
  return userMap;
}

module.exports = {
  loadRecommendationsArray,
  getUserMap,
  getFullListJsonString,
  getUserJsonString,
  JSON_UTF8
};
