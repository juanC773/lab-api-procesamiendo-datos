const { loadRecommendationsArray } = require("../../lib/recommendations");

module.exports = (req, res) => {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const recommendations = loadRecommendationsArray();
    return res.status(200).json(recommendations);
  } catch (error) {
    return res.status(500).json({
      error: "Internal server error",
      detail: error.message
    });
  }
};
