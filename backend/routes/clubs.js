const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', (req, res) => {
  db.query('SELECT * FROM clubs', (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
});

router.get('/:category', (req, res) => {
  const category = req.params.category;
  db.query(
    'SELECT club_name, description FROM clubs WHERE category = ?',
    [category],
    (err, result) => {
      if (err) return res.status(500).json(err);
      res.json(result);
    }
  );
});

module.exports = router;   // 🔴 MUST BE PRESENT
