const express = require("express");
const router = express.Router();
const db = require("../db");

// GET CLUBS BY CATEGORY (for cultural/technical pages)
router.get("/category/:category", (req, res) => {
    const category = req.params.category;
    const sql = `
        SELECT c.*, COALESCE(a.achievement_text, 'Milestones coming soon.') AS achievement_text
        FROM clubs c
        LEFT JOIN club_achievements a ON c.id = a.id
        WHERE LOWER(c.category) = LOWER(?)`;

    db.query(sql, [category], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// GET EVENTS BY CLUB ID (for modal)
router.get("/events/:clubId", (req, res) => {
    const clubId = req.params.clubId;
    const sql = `
        SELECT event_name, venue, event_date
        FROM events
        WHERE club_id = ?
        ORDER BY event_date ASC`;

    db.query(sql, [clubId], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// ADD EVENT (from faculty dashboard)
router.post("/events/add", (req, res) => {
    const { club_id, event_name, event_date, venue, description } = req.body;
    if (!club_id || !event_name || !event_date || !venue) {
        return res.status(400).json({ error: "Missing required event fields" });
    }

    const sql = `
        INSERT INTO events (club_id, event_name, event_date, venue, description)
        VALUES (?, ?, ?, ?, ?)`;

    db.query(sql, [club_id, event_name, event_date, venue, description || ""], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Event scheduled successfully!" });
    });
});

// UPDATE ACHIEVEMENTS ONLY (does not overwrite club details)
router.post("/achievements", (req, res) => {
    const { club_id, achievement_text } = req.body;
    if (!club_id) return res.status(400).json({ error: "club_id is required" });

    const selectSql = "SELECT achievement_text FROM club_achievements WHERE id = ?";
    db.query(selectSql, [club_id], (selErr, rows) => {
        if (selErr) return res.status(500).json({ error: selErr.message });

        const incoming = (achievement_text || "").trim();
        const existing = rows.length > 0 ? (rows[0].achievement_text || "").trim() : "";
        const combined = existing && incoming ? `${existing}\n${incoming}` : (existing || incoming);

        if (rows.length === 0) {
            const insertSql = `
                INSERT INTO club_achievements (id, achievement_text)
                VALUES (?, ?)`;
            return db.query(insertSql, [club_id, combined], (insErr) => {
                if (insErr) return res.status(500).json({ error: insErr.message });
                res.json({ message: "Achievements saved successfully!" });
            });
        }

        const updateSql = `
            UPDATE club_achievements
            SET achievement_text = ?
            WHERE id = ?`;
        db.query(updateSql, [combined, club_id], (updErr) => {
            if (updErr) return res.status(500).json({ error: updErr.message });
            res.json({ message: "Achievements updated successfully!" });
        });
    });
});

// ADD/UPDATE CLUB (Synchronize clubs, achievements, contacts)
router.post("/manage", (req, res) => {
    const { club_name, category, description, achievement_text, head_name, email, phone } = req.body;

    db.beginTransaction((err) => {
        if (err) return res.status(500).json({ error: "Transaction failed to start" });

        const sqlClubs = `
            INSERT INTO clubs (club_name, category, description)
            VALUES (?, ?, ?)
            ON DUPLICATE KEY UPDATE category = VALUES(category), description = VALUES(description)`;

        db.query(sqlClubs, [club_name, category, description], (err1) => {
            if (err1) return db.rollback(() => res.status(500).json({ error: "Clubs table update failed" }));

            db.query("SELECT id FROM clubs WHERE club_name = ?", [club_name], (err2, rows) => {
                if (err2 || rows.length === 0) return db.rollback(() => res.status(500).json({ error: "ID fetch failed" }));
                const finalId = rows[0].id;

                const sqlAchieve = `
                    INSERT INTO club_achievements (id, club_name, achievement_text)
                    VALUES (?, ?, ?)
                    ON DUPLICATE KEY UPDATE achievement_text = VALUES(achievement_text)`;

                db.query(sqlAchieve, [finalId, club_name, achievement_text || ""], (err3) => {
                    if (err3) return db.rollback(() => res.status(500).json({ error: "Achievement table update failed" }));

                    const sqlContacts = `
                        INSERT INTO club_contacts (id, club_name, head_name, email, phone)
                        VALUES (?, ?, ?, ?, ?)
                        ON DUPLICATE KEY UPDATE head_name = VALUES(head_name), email = VALUES(email), phone = VALUES(phone)`;

                    db.query(sqlContacts, [finalId, club_name, head_name, email, phone], (err4) => {
                        if (err4) return db.rollback(() => res.status(500).json({ error: "Contacts table update failed" }));

                        db.commit((errCommit) => {
                            if (errCommit) return db.rollback(() => res.status(500).json({ error: "Commit failed" }));
                            res.json({ message: "Club successfully updated across all tables atomically!" });
                        });
                    });
                });
            });
        });
    });
});

// DELETE CLUB (CASCADE CLEANUP)
router.delete("/:name", (req, res) => {
    const clubName = req.params.name;

    db.beginTransaction((err) => {
        if (err) return res.status(500).json({ error: "Transaction error" });

        // Get ID first to delete child records
        db.query("SELECT id FROM clubs WHERE club_name = ?", [clubName], (err, rows) => {
            if (err || rows.length === 0) return db.rollback(() => res.status(404).json({ error: "Club not found" }));
            const clubId = rows[0].id;

            const deleteQueries = [
                "DELETE FROM events WHERE club_id = ?",
                "DELETE FROM memberships WHERE club_id = ?",
                "DELETE FROM club_achievements WHERE id = ?",
                "DELETE FROM club_contacts WHERE id = ?"
            ];

            let completed = 0;
            deleteQueries.forEach(sql => {
                db.query(sql, [clubId], (qErr) => {
                    if (qErr) return db.rollback(() => res.status(500).json({ error: "Cleanup failed" }));
                    completed++;

                    if (completed === deleteQueries.length) {
                        db.query("DELETE FROM clubs WHERE id = ?", [clubId], (finalErr) => {
                            if (finalErr) return db.rollback(() => res.status(500).json({ error: "Final delete failed" }));
                            db.commit((cErr) => {
                                if (cErr) return db.rollback(() => res.status(500).json({ error: "Commit failed" }));
                                res.json({ message: "Club deleted successfully." });
                            });
                        });
                    }
                });
            });
        });
    });
});

module.exports = router;
