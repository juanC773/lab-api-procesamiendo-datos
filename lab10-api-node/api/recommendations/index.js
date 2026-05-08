const {
  getFullListJsonString,
  JSON_UTF8
} = require("../../lib/recommendations");

function applyCors(req, res) {
  // Para el laboratorio: permitir consumo desde cualquier frontend/origen.
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  // Evita caches mezclando respuestas entre orígenes/proxies.
  res.setHeader("Vary", "Origin");
}

module.exports = (req, res) => {
  applyCors(req, res);

  // Preflight CORS
  if (req.method === "OPTIONS") {
    return res.status(204).send("");
  }

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const body = getFullListJsonString();
    res.setHeader("Content-Type", JSON_UTF8);
    // Datos estáticos del lab: cache corto en CDN de Vercel (menos cold hits percibidos)
    res.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=600");
    return res.status(200).send(body);
  } catch (error) {
    return res.status(500).json({
      error: "Internal server error",
      detail: error.message
    });
  }
};
