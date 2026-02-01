const express = require("express");
const router = express.Router();
const db = require("../db");

// 1. Get Cultural Clubs with Achievements
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

// 2. Get Technical Clubs with Achievements
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

// 3. Get All Clubs (Master List)
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

// 4. MANAGEMENT: Add or Update Club (The fix for your error)
router.post("/manage", (req, res) => {
    const { club_name, category, description, achievement_text } = req.body;

    if (!club_name || !category) {
        return res.status(400).json({ error: "Club Name and Category are required." });
    }

    const sqlClubs = `
        INSERT INTO clubs (club_name, category, description) 
        VALUES (?, ?, ?) 
        ON DUPLICATE KEY UPDATE 
            category = VALUES(category), 
            description = VALUES(description)`;
    
    // NOTE: We use 'sqlClubs' here to match the variable above
    db.query(sqlClubs, [club_name, category, description], (err, result) => {
        if (err) {
            console.error("❌ Error updating clubs table:", err.message);
            return res.status(500).json({ error: err.message });
        }

        const sqlAchieve = `
            INSERT INTO club_achievements (club_name, achievement_text) 
            VALUES (?, ?) 
            ON DUPLICATE KEY UPDATE 
                achievement_text = VALUES(achievement_text)`;
        
        db.query(sqlAchieve, [club_name, achievement_text], (err2) => {
            if (err2) {
                console.error("❌ Error updating achievements table:", err2.message);
                return res.status(500).json({ error: err2.message });
            }
            
            res.json({ 
                message: `Database successfully synchronized for ${club_name}!`,
                status: "success" 
            });
        });
    });
});

module.exports = router;