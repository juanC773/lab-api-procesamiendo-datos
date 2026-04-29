const { getUserMap } = require("../../lib/recommendations");

module.exports = (req, res) => {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const map = getUserMap();
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
