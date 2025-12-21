const express = require('express');
const router = express.Router();
const db = require('../db');

// POST: Recommend clubs based on selected interests
router.post('/interests', (req, res) => {
  const interests = req.body.interests;

  if (!interests || interests.length === 0) {
    return res.json([]);
  }

  const sql = `
    SELECT DISTINCT 
      c.club_name, 
      c.category, 
      c.description
    FROM clubs c
    JOIN club_interests ci ON c.club_id = ci.club_id
    JOIN interest i ON ci.interest_id = i.interest_id
    WHERE i.name IN (?)
  `;

  db.query(sql, [interests], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(results);
  });
});

module.exports = router;
