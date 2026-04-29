const { getUserJsonString, JSON_UTF8 } = require("../../lib/recommendations");

module.exports = (req, res) => {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { user_id } = req.query;
    const body = getUserJsonString(user_id);

    if (body === null) {
      return res.status(404).json({ error: "User not found" });
    }

    res.setHeader("Content-Type", JSON_UTF8);
    res.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=600");
    return res.status(200).send(body);
  } catch (error) {
    return res.status(500).json({
      error: "Internal server error",
      detail: error.message
    });
  }
};
