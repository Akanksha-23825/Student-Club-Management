const express = require("express");
const router = express.Router();
const db = require("../db");
const bcrypt = require('bcrypt');
const saltRounds = 10;

// 1. SIGNUP: Encrypting the password
router.post("/signup", async (req, res) => {
    const { username, password, role } = req.body;
    
    try {
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        
        const sql = "INSERT INTO users (username, password, role) VALUES (?, ?, ?)";
        db.query(sql, [username, hashedPassword, role], (err) => {
            if (err) {
                console.error("❌ Signup Error:", err.message);
                return res.status(500).json({ error: "User already exists or DB error" });
            }
            res.json({ message: "Account created successfully with encryption!" });
        });
    } catch (error) {
        console.error("❌ Hashing Error:", error);
        res.status(500).json({ error: "Server error during hashing" });
    }
});

// 2. LOGIN: With Debugging Logs
router.post("/login", (req, res) => {
    const { username, password } = req.body;

    const sql = "SELECT * FROM users WHERE username = ?";
    db.query(sql, [username], async (err, results) => {
        if (err) {
            console.error("❌ DB Query Error:", err);
            return res.status(500).json({ error: "Database error" });
        }

        if (results.length === 0) {
            console.log(`⚠️ Login attempt failed: Username "${username}" not found.`);
            return res.status(401).json({ error: "Invalid credentials" });
        }

        const user = results[0];

        // DEBUG CHECK: If the password in DB doesn't start with $2b$, it's not a hash!
        if (!user.password.startsWith('$2b$')) {
            console.error("❌ SECURITY ALERT: Found plain-text password in DB for user:", username);
            return res.status(401).json({ error: "System error: Plain-text passwords detected. Please re-register." });
        }

        try {
            const isMatch = await bcrypt.compare(password, user.password);
            
            if (isMatch) {
                console.log(`✅ Login successful for: ${username}`);
                res.json({ 
                    message: "Login successful", 
                    role: user.role,
                    username: user.username 
                });
            } else {
                console.log(`⚠️ Password mismatch for user: ${username}`);
                res.status(401).json({ error: "Invalid credentials" });
            }
        } catch (compError) {
            console.error("❌ Bcrypt Compare Error:", compError);
            res.status(500).json({ error: "Error verifying password" });
        }
    });
});

module.exports = router;