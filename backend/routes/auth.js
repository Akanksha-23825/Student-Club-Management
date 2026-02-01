const express = require("express");
const router = express.Router();
const db = require("../db");
// Note: In a real app, use bcrypt to hash passwords!

router.post("/signup", (req, res) => {
    const { username, password, role } = req.body;
    const sql = "INSERT INTO users (username, password, role) VALUES (?, ?, ?)";
    db.query(sql, [username, password, role], (err) => {
        if (err) return res.status(500).json({ error: "User already exists" });
        res.json({ message: "Account created successfully!" });
    });
});

router.post("/login", (req, res) => {
    const { username, password } = req.body;
    const sql = "SELECT * FROM users WHERE username = ? AND password = ?";
    db.query(sql, [username, password], (err, results) => {
        if (err || results.length === 0) return res.status(401).json({ error: "Invalid credentials" });
        
        const user = results[0];
        res.json({ 
            message: "Login successful", 
            role: user.role,
            username: user.username 
        });
    });
});

module.exports = router;