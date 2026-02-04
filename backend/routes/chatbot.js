const express = require("express");
const router = express.Router();
const db = require("../db");

router.post("/", (req, res) => {
  const { message, username } = req.body; 
  if (!message) return res.status(400).json({ reply: "Please enter a message." });

  const cleanMsg = message.toLowerCase().replace(/[?.,!]/g, "").trim();
  
  const stripMd = (text) =>
    (text || "")
      .replace(/\*\*/g, "")
      .replace(/__/g, "")
      .replace(/[*_`]/g, "");

  // 1. INTENT DETECTION
  const isContactReq = cleanMsg.includes("contact") || cleanMsg.includes("who") || cleanMsg.includes("whom") || cleanMsg.includes("call");
  const isAchieveReq = cleanMsg.includes("achievement") || cleanMsg.includes("won") || cleanMsg.includes("award");
  const isEventReq = cleanMsg.includes("event") || cleanMsg.includes("workshop") || cleanMsg.includes("happen");
  const isActiveReq = cleanMsg.includes("active") || cleanMsg.includes("my club") || cleanMsg.includes("joined");
  const isInterestReq = cleanMsg.includes("interest") || cleanMsg.includes("interested") || cleanMsg.includes("love") || cleanMsg.includes("recommend") || cleanMsg.includes("suggest");

  // 2. TARGETED KEYWORD EXTRACTION
  const stopPhrases = [
    "who to contact for", "whom to contact for", "who should i contact for", 
    "tell me about", "details of", "achievements of", "events of"
  ];
  
  let keyword = cleanMsg;
  stopPhrases.forEach(phrase => {
    keyword = keyword.replace(phrase, "");
  });
  keyword = keyword.trim();

  // 3. PERSONAL ACTIVE CLUB LOGIC
  if (isActiveReq) {
      if (!username) return res.json({ reply: "Please log in to see your active memberships." });
      const sqlActive = `
          SELECT c.club_name FROM memberships m
          JOIN clubs c ON m.club_id = c.id
          WHERE m.username = ? AND m.status = 'Active'`;
      
      db.query(sqlActive, [username], (err, results) => {
          if (err) return res.status(500).json({ reply: "Database error." });
          if (results.length === 0) return res.json({ reply: "You aren't active in any clubs yet!" });
          const list = results.map(r => `• ${stripMd(r.club_name)}`).join('\n');
          return res.json({ reply: `You are an active member of:\n${list}` });
      });
      return; 
  }

  // 4. INTEREST-BASED RECOMMENDATION (FIXED: Removed .substring)
  if (isInterestReq) {
      const interestPhrases = ["interest in", "interested in", "love", "recommend", "suggest"];
      let interestText = cleanMsg;
      interestPhrases.forEach(p => {
          if (interestText.includes(p)) interestText = interestText.split(p).pop();
      });
      const interests = interestText.split(/,|and|&/g).map(s => s.trim()).filter(Boolean);

      if (interests.length === 0) {
          return res.json({ reply: "Tell me your interests (e.g., 'Suggest clubs for robotics or dance')." });
      }

      const likeTerms = interests.map(i => `%${i}%`);
      const placeholders = likeTerms.map(() => "LOWER(ci.interest) LIKE LOWER(?)").join(" OR ");
      const sqlInterests = `
          SELECT DISTINCT c.club_name, c.category, c.description
          FROM club_interests ci
          JOIN clubs c ON c.id = ci.id
          WHERE ${placeholders}`;

      db.query(sqlInterests, likeTerms, (iErr, rows) => {
          if (iErr) return res.status(500).json({ reply: "Database error." });
          if (rows.length === 0) return res.json({ reply: "I couldn't find clubs for those interests." });
          
          // FIXED: Removed .substring(0, 60) to show full description
          const list = rows.map(c => `• ${stripMd(c.club_name)} (${stripMd(c.category)}): ${stripMd(c.description)}`).join('\n\n');
          return res.json({ reply: `Based on your interest, I recommend:\n\n${list}` });
      });
      return; 
  }

  // 5. POWERFUL MULTI-TABLE JOIN
  const sqlBroad = `
      SELECT c.id, c.club_name, c.category, c.description, 
             a.achievement_text AS achievements,
             co.head_name, co.phone, co.email,
             GROUP_CONCAT(DISTINCT CONCAT('• ', e.event_name, ' (', DATE_FORMAT(e.event_date, '%b %d'), ')') SEPARATOR '\n') AS upcoming_events
      FROM clubs c
      LEFT JOIN club_achievements a ON c.id = a.id
      LEFT JOIN club_contacts co ON c.id = co.id
      LEFT JOIN events e ON c.id = e.club_id AND e.event_date >= CURDATE()
      WHERE LOWER(c.club_name) LIKE ? OR LOWER(c.description) LIKE ?
      GROUP BY c.id`;

  db.query(sqlBroad, [`%${keyword}%`, `%${keyword}%`], (err, results) => {
    if (err) return res.status(500).json({ reply: "Database error." });
    if (results.length === 0) return res.json({ reply: "I couldn't find that club. Try 'Alaap' or 'Dhruva'!" });

    const c = results[0];
    if (isContactReq) {
      return res.json({ reply: `👤 Contact for ${stripMd(c.club_name)}:\nName: ${stripMd(c.head_name) || "TBD"}\n📞 Phone: ${c.phone || "N/A"}\n📧 Email: ${c.email || "N/A"}` });
    }
    if (isEventReq) {
      return res.json({ reply: `📅 Upcoming Events for ${stripMd(c.club_name)}:\n${stripMd(c.upcoming_events) || "No events scheduled."}` });
    }
    if (isAchieveReq) {
      return res.json({ reply: `🏆 Achievements for ${stripMd(c.club_name)}:\n${stripMd(c.achievements) || "N/A"}` });
    }

    return res.json({ reply: `📌 ${stripMd(c.club_name)} (${stripMd(c.category)})\n📖 ${stripMd(c.description)}\n\n🏆 Achievements: ${stripMd(c.achievements) || "N/A"}\n\n📅 Events:\n${stripMd(c.upcoming_events) || "None"}` });
  });
});

module.exports = router;
