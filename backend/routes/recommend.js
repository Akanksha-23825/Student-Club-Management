const express = require("express");
const router = express.Router();
const db = require("../db");

router.post("/", (req, res) => {
    const { interests } = req.body;

    if (!interests || interests.length === 0) {
        return res.status(400).json({ error: "No interests provided" });
    }

    // Joining on club_name for interests and id for achievements
    const sql = `
        SELECT c.club_name, c.category, c.description, a.achievement_text,
               GROUP_CONCAT(ci.interest SEPARATOR ', ') AS matched_interests
        FROM clubs c
        JOIN club_interests ci ON c.club_name = ci.club_name
        LEFT JOIN club_achievements a ON c.id = a.id
        WHERE ci.interest IN (?)
        GROUP BY c.id
        ORDER BY COUNT(ci.interest) DESC`;

    db.query(sql, [interests], (err, results) => {
        if (err) {
            console.error("❌ Recommendation Error:", err.message);
            return res.status(500).json({ error: "Database error" });
        }
        res.json(results);
    });
});

module.exports = router;