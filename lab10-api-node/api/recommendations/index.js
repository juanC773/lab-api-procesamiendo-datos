const fs = require("fs");
const path = require("path");

let cachedData = null;

function loadRecommendations() {
  if (cachedData) return cachedData;

  const dataPath = path.join(process.cwd(), "data", "recommendations.json");
  const raw = fs.readFileSync(dataPath, "utf8");
  const parsed = JSON.parse(raw);

  if (!Array.isArray(parsed)) {
    throw new Error("data/recommendations.json must be an array");
  }

  cachedData = parsed;
  return cachedData;
}

module.exports = (req, res) => {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const recommendations = loadRecommendations();
    return res.status(200).json(recommendations);
  } catch (error) {
    return res.status(500).json({
      error: "Internal server error",
      detail: error.message
    });
  }
};
