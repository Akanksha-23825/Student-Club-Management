const express = require("express");
const router = express.Router();
const db = require("../db"); // your db connection

router.post("/", (req, res) => {
  const { email, password } = req.body;

  const sql = "SELECT * FROM users WHERE email=? AND password=?";
  db.query(sql, [email, password], (err, result) => {
    if (err) return res.status(500).json({ success: false });

    if (result.length > 0) {
      res.json({ success: true });
    } else {
      res.json({ success: false, message: "Invalid credentials" });
    }
  });
});

module.exports = router;
