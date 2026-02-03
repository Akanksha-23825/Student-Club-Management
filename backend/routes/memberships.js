const express = require("express");
const router = express.Router();
const db = require("../db");

// 1. STUDENT: Request to Join a Club
// This aligns with the 'Expresses' relationship in your ER Diagram
router.post("/apply", (req, res) => {
    const { username, club_id } = req.body;

    if (!username || !club_id) {
        return res.status(400).json({ error: "Missing username or club ID" });
    }

    // Check if a membership already exists to prevent duplicates
    const checkSql = "SELECT * FROM memberships WHERE username = ? AND club_id = ?";
    db.query(checkSql, [username, club_id], (err, results) => {
        if (err) return res.status(500).json({ error: "Database error" });
        if (results.length > 0) {
            return res.status(400).json({ message: "You have already applied to this club." });
        }

        // Insert new membership with 'Pending' status
        const insertSql = "INSERT INTO memberships (username, club_id, status) VALUES (?, ?, 'Pending')";
        db.query(insertSql, [username, club_id], (err) => {
            if (err) return res.status(500).json({ error: "Failed to submit application" });
            res.json({ message: "Application submitted successfully! Awaiting faculty approval." });
        });
    });
});

// 2. FACULTY: View Applications for their Club
// This uses the 'Has' relationship between Faculty and Clubs
router.get("/pending/:club_id", (req, res) => {
    const { club_id } = req.params;
    const sql = `
        SELECT m.membership_id, m.username, m.joined_date, m.status 
        FROM memberships m 
        WHERE m.club_id = ? AND m.status = 'Pending'`;
    
    db.query(sql, [club_id], (err, results) => {
        if (err) return res.status(500).json({ error: "Database error" });
        res.json(results);
    });
});

// 3. FACULTY: Update Membership Status
// Changes status to 'Active' or 'Rejected'
router.put("/update-status", (req, res) => {
    const { membership_id, new_status } = req.body; // new_status: 'Active' or 'Rejected'

    if (!['Active', 'Rejected'].includes(new_status)) {
        return res.status(400).json({ error: "Invalid status update" });
    }

    const sql = "UPDATE memberships SET status = ? WHERE membership_id = ?";
    db.query(sql, [new_status, membership_id], (err, result) => {
        if (err) return res.status(500).json({ error: "Database error" });
        res.json({ message: `Membership successfully ${new_status}!` });
    });
});

// 4. STUDENT: View My Club Memberships
// Fetches all clubs a student is part of
router.get("/my-clubs/:username", (req, res) => {
    const { username } = req.params;
    const sql = `
        SELECT c.club_name, c.category, m.status, m.joined_date 
        FROM memberships m 
        JOIN clubs c ON m.club_id = c.id 
        WHERE m.username = ?`;

    db.query(sql, [username], (err, results) => {
        if (err) return res.status(500).json({ error: "Database error" });
        res.json(results);
    });
});

module.exports = router;