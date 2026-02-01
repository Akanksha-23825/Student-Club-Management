const express = require("express");
const router = express.Router();
const db = require("../db");

router.post("/", (req, res) => {
    const { interests } = req.body;

    if (!interests || interests.length === 0) {
        return res.status(400).json({ error: "No interests provided" });
    }

    // This query finds clubs based on interests and JOINS achievements
    // Updated SQL query inside routes/recommend.js
const sql = `
    SELECT 
        c.club_name, 
        c.category, 
        c.description, 
        a.achievement_text,
        GROUP_CONCAT(ci.interest SEPARATOR ', ') AS matched_interests
    FROM clubs c
    JOIN club_interests ci ON c.club_name = ci.club_name
    LEFT JOIN club_achievements a ON c.club_name = a.club_name
    WHERE ci.interest IN (?)
    GROUP BY c.club_name, c.category, c.description, a.achievement_text
    ORDER BY COUNT(ci.interest) DESC;
`;
    db.query(sql, [interests], (err, results) => {
        if (err) {
            console.error("❌ Recommendation Engine Error:", err.message);
            return res.status(500).json({ error: "Database error" });
        }
        res.json(results);
    });
});

module.exports = router;