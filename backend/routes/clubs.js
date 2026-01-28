const express = require("express");
const router = express.Router();
const db = require("../db");

// Get Cultural Clubs with Achievements
router.get("/cultural", (req, res) => {
    const sql = `
        SELECT c.*, a.achievement_text 
        FROM clubs c 
        LEFT JOIN club_achievements a ON c.club_name = a.club_name 
        WHERE c.category = 'Cultural'`;
        
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// Get Technical Clubs with Achievements
router.get("/technical", (req, res) => {
    const sql = `
        SELECT c.*, a.achievement_text 
        FROM clubs c 
        LEFT JOIN club_achievements a ON c.club_name = a.club_name 
        WHERE c.category = 'Technical'`;
        
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// Get All Clubs (Master List) with Achievements
router.get("/", (req, res) => {
    const sql = `
        SELECT c.*, a.achievement_text 
        FROM clubs c 
        LEFT JOIN club_achievements a ON c.club_name = a.club_name`;
        
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

module.exports = router;