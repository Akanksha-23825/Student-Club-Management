const express = require("express");
const router = express.Router();
const db = require("../db");

// 1. GET CLUBS BY CATEGORY
router.get("/category/:category", (req, res) => {
    const category = req.params.category;
    const sql = `
        SELECT c.*, COALESCE(a.achievement_text, 'Milestones coming soon.') AS achievement_text
        FROM clubs c
        LEFT JOIN club_achievements a ON c.id = a.id
        WHERE LOWER(c.category) = LOWER(?)`;

    db.query(sql, [category], (err, results) => {
        if (err) return res.status(500).json({ error: "Database query failed" });
        res.json(results);
    });
});

// 2. GET EVENTS BY CLUB ID
router.get("/events/:clubId", (req, res) => {
    const clubId = req.params.clubId;
    const sql = `SELECT event_name, venue, event_date FROM events WHERE club_id = ? ORDER BY event_date ASC`;
    db.query(sql, [clubId], (err, results) => {
        if (err) return res.status(500).json({ error: "Event fetch failed" });
        res.json(results);
    });
});

// 3. GET ACHIEVEMENTS BY CLUB ID
router.get("/achievements/:clubId", (req, res) => {
    const clubId = req.params.clubId;
    const sql = `SELECT achievement_text FROM club_achievements WHERE id = ?`;
    db.query(sql, [clubId], (err, results) => {
        if (err) return res.status(500).json({ error: "Achievement fetch failed" });
        if (results.length === 0) return res.json({ achievement_text: "" });
        res.json(results[0]);
    });
});

// 4. POST NEW EVENT (Fixed: Added this missing route to stop the JSON error)
router.post("/events/add", (req, res) => {
    const { club_id, event_name, event_date, venue, description } = req.body;
    if (!club_id || !event_name || !event_date) {
        return res.status(400).json({ error: "Required event fields are missing." });
    }

    const sql = `INSERT INTO events (club_id, event_name, event_date, venue, description) VALUES (?, ?, ?, ?, ?)`;
    db.query(sql, [club_id, event_name, event_date, venue, description], (err, result) => {
        if (err) return res.status(500).json({ error: "Database insertion failed." });
        res.json({ message: "Event scheduled successfully!" });
    });
});

// 5. UPDATE ACHIEVEMENTS (Atomic Upsert)
router.post("/achievements", (req, res) => {
    const { club_id, achievement_text } = req.body;
    if (!club_id) return res.status(400).json({ error: "club_id is required" });

    const sql = `
        INSERT INTO club_achievements (id, achievement_text) 
        VALUES (?, ?) 
        ON DUPLICATE KEY UPDATE achievement_text = VALUES(achievement_text)`;
            
    db.query(sql, [club_id, achievement_text.trim()], (err) => {
        if (err) return res.status(500).json({ error: "Upsert failed" });
        res.json({ message: "Achievements updated successfully!" });
    });
});

// 6. ADMIN: CREATE CLUB (Atomic insert across related tables)
router.post("/manage", (req, res) => {
    const { club_name, category, description, achievement_text, head_name, email, phone } = req.body;
    if (!club_name || !category || !description) {
        return res.status(400).json({ error: "club_name, category, and description are required" });
    }

    db.beginTransaction(err => {
        if (err) return res.status(500).json({ error: "Failed to start transaction" });

        const insertClubSql = `INSERT INTO clubs (club_name, category, description) VALUES (?, ?, ?)`;
        db.query(insertClubSql, [club_name, category, description], (err, result) => {
            if (err) {
                return db.rollback(() => res.status(500).json({ error: "Club creation failed" }));
            }

            const clubId = result.insertId;
            const insertAchSql = `INSERT INTO club_achievements (id, achievement_text) VALUES (?, ?)`;
            const insertContactSql = `INSERT INTO club_contacts (id, head_name, email, phone) VALUES (?, ?, ?, ?)`;

            db.query(insertAchSql, [clubId, achievement_text || "Milestones coming soon!"], (err) => {
                if (err) {
                    return db.rollback(() => res.status(500).json({ error: "Achievement init failed" }));
                }

                db.query(insertContactSql, [clubId, head_name || "TBD", email || "TBD", phone || "TBD"], (err) => {
                    if (err) {
                        return db.rollback(() => res.status(500).json({ error: "Contact init failed" }));
                    }

                    db.commit(err => {
                        if (err) {
                            return db.rollback(() => res.status(500).json({ error: "Commit failed" }));
                        }
                        res.json({ message: "Club created successfully!" });
                    });
                });
            });
        });
    });
});

// 7. ADMIN: DELETE CLUB BY NAME (safe delete if no FK cascade)
router.delete("/:clubName", (req, res) => {
    const { clubName } = req.params;
    if (!clubName) return res.status(400).json({ error: "clubName is required" });

    db.beginTransaction(err => {
        if (err) return res.status(500).json({ error: "Failed to start transaction" });

        const findSql = `SELECT id FROM clubs WHERE club_name = ?`;
        db.query(findSql, [clubName], (err, results) => {
            if (err) {
                return db.rollback(() => res.status(500).json({ error: "Lookup failed" }));
            }
            if (results.length === 0) {
                return db.rollback(() => res.status(404).json({ error: "Club not found" }));
            }

            const clubId = results[0].id;
            const deleteMembersSql = `DELETE FROM memberships WHERE club_id = ?`;
            const deleteEventsSql = `DELETE FROM events WHERE club_id = ?`;
            const deleteAchSql = `DELETE FROM club_achievements WHERE id = ?`;
            const deleteContactsSql = `DELETE FROM club_contacts WHERE id = ?`;
            const deleteInterestsSql = `DELETE FROM club_interests WHERE club_name = ?`;
            const deleteClubSql = `DELETE FROM clubs WHERE id = ?`;

            db.query(deleteMembersSql, [clubId], (err) => {
                if (err) return db.rollback(() => res.status(500).json({ error: "Failed to delete memberships" }));
                db.query(deleteEventsSql, [clubId], (err) => {
                    if (err) return db.rollback(() => res.status(500).json({ error: "Failed to delete events" }));
                    db.query(deleteAchSql, [clubId], (err) => {
                        if (err) return db.rollback(() => res.status(500).json({ error: "Failed to delete achievements" }));
                        db.query(deleteContactsSql, [clubId], (err) => {
                            if (err) return db.rollback(() => res.status(500).json({ error: "Failed to delete contacts" }));
                            db.query(deleteInterestsSql, [clubName], (err) => {
                                if (err) return db.rollback(() => res.status(500).json({ error: "Failed to delete interests" }));
                                db.query(deleteClubSql, [clubId], (err) => {
                                    if (err) return db.rollback(() => res.status(500).json({ error: "Failed to delete club" }));
                                    db.commit(err => {
                                        if (err) return db.rollback(() => res.status(500).json({ error: "Commit failed" }));
                                        res.json({ message: "Club deleted successfully." });
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });
    });
});

module.exports = router;
