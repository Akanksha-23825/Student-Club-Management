const express = require("express");
const router = express.Router();
const db = require("../db");

router.post("/", (req, res) => {
  let interests = req.body.interests;

  if (!interests || interests.length === 0) {
    return res.json([]);
  }

  // Trim and normalize interests
  interests = interests.map(i => i.trim());
  const placeholders = interests.map(() => "?").join(",");
// Inside backend/routes/recommend.js
const sql = `
    SELECT 
        c.club_name, 
        c.category, 
        c.description,
        GROUP_CONCAT(ci.interest SEPARATOR ', ') AS matched_interests,
        COUNT(ci.interest) AS match_count
    FROM clubs c
    JOIN club_interests ci ON c.club_name = ci.club_name
    WHERE ci.interest IN (${placeholders})
    GROUP BY c.club_name, c.category, c.description
    ORDER BY match_count DESC;
`;

  db.query(sql, interests, (err, results) => {
    if (err) {
      console.error("❌ Recommendation Error:", err);
      return res.status(500).json({ error: "Database query failed" });
    }
    res.json(results);
  });
});

module.exports = router;