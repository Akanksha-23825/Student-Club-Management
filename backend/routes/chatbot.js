const express = require("express");
const router = express.Router();
const db = require("../db");

router.post("/", (req, res) => {
    // 1. Get message and clean it (remove punctuation and convert to lowercase)
    const rawMessage = req.body.message ? req.body.message.toLowerCase() : "";
    const cleanMessage = rawMessage.replace(/[?.,!]/g, "");
    
    // 2. Split into individual words to find keywords
    const words = cleanMessage.split(" ");
    
    // 3. Prepare the SQL query to search for ANY of these words
    let sql = `
        SELECT DISTINCT c.club_name, c.description, c.category 
        FROM clubs c
        LEFT JOIN club_interests ci ON c.club_name = ci.club_name
        WHERE 1=0
    `;

    const params = [];
    words.forEach(word => {
        // Only search for words longer than 2 letters to avoid "for", "the", "is"
        if (word.length > 2) {
            sql += ` OR LOWER(c.club_name) LIKE ? OR LOWER(ci.interest) LIKE ? OR LOWER(c.category) LIKE ?`;
            params.push(`%${word}%`, `%${word}%`, `%${word}%`);
        }
    });

    db.query(sql, params, (err, results) => {
        if (err) {
            console.error("❌ Chatbot Error:", err);
            return res.status(500).json({ reply: "I'm having trouble searching the database." });
        }

        if (results.length > 0) {
            let reply = "I found some clubs you might like:\n\n";
            results.forEach(club => {
                reply += `📌 **${club.club_name}** (${club.category})\n`;
                reply += `📖 ${club.description || "Detailed info available on our portal."}\n\n`;
            });
            res.json({ reply: reply });
        } else {
            res.json({ reply: `❌ I couldn't find any clubs matching "${cleanMessage}". Try keywords like 'Coding', 'Dance', or 'Space'.` });
        }
    });
});

module.exports = router;