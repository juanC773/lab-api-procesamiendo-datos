const {
  getFullListJsonString,
  JSON_UTF8
} = require("../../lib/recommendations");

module.exports = (req, res) => {
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
