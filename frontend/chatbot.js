const express = require("express");
const router = express.Router();

/**
 * POST /api/chatbot
 * Corrected to handle 'message' and return 'reply'
 */
router.post("/", (req, res) => {
  // Frontend sends 'message'
  const { message } = req.body; 

  if (!message) {
    return res.status(400).json({ reply: "Please enter a message." }); //
  }

  const userQuery = message.toLowerCase();
  let responseText = "I am your Student Club Assistant. You asked: " + message;

  // Simple keyword logic for club queries
  if (userQuery.includes("recommend") || userQuery.includes("suggest")) {
    responseText = "Please visit the 'Get Recommendation' page to find clubs based on your interests!";
  } else if (userQuery.includes("club") || userQuery.includes("list")) {
    responseText = "We have many Technical and Cultural clubs. Check the 'Clubs' menu for details.";
  } else if (userQuery.includes("hello") || userQuery.includes("hi")) {
    responseText = "Hello! How can I help you find a club today?";
  }

  // Frontend expects 'reply'
  res.json({
    reply: responseText
  });
});

module.exports = router;