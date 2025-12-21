const express = require('express');
const router = express.Router();

router.post('/', (req, res) => {
  const msg = req.body.message.toLowerCase();
  let reply = "Sorry, I didn't understand your question.";

  if (msg.includes('cultural')) {
    reply = "Cultural clubs include Music, Dance, Drama, and Photography.";
  } 
  else if (msg.includes('technical') || msg.includes('innovative')) {
    reply = "Innovative clubs include Coding Club, Robotics Club, and AI Club.";
  } 
  else if (msg.includes('robotics')) {
    reply = "Robotics Club focuses on robotics and automation projects.";
  } 
  else if (msg.includes('music')) {
    reply = "Music Club conducts musical and cultural events.";
  }

  res.json({ reply });
});

module.exports = router;   // 🔴 MUST BE PRESENT
