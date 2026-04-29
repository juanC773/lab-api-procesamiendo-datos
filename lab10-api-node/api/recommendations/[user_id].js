const fs = require("fs");
const path = require("path");

let cachedData = null;
let userMap = null;

function loadRecommendationsMap() {
  if (userMap) return userMap;

  if (!cachedData) {
    const dataPath = path.join(process.cwd(), "data", "recommendations.json");
    const raw = fs.readFileSync(dataPath, "utf8");
    const parsed = JSON.parse(raw);

    if (!Array.isArray(parsed)) {
      throw new Error("data/recommendations.json must be an array");
    }
    cachedData = parsed;
  }

  userMap = new Map();
  for (const row of cachedData) {
    userMap.set(String(row.user_id), row);
  }
  return userMap;
}

module.exports = (req, res) => {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const map = loadRecommendationsMap();
    const { user_id } = req.query;
    const found = map.get(String(user_id));

    if (!found) {
      return res.status(404).json({ error: "User not found" });
    }
    return res.status(200).json(found);
  } catch (error) {
    return res.status(500).json({
      error: "Internal server error",
      detail: error.message
    });
  }
};
