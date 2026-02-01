const express = require("express");
const cors = require("cors");
const path = require("path");
const db = require("./db"); 

const app = express();

// 1. Import Auth Routes
const authRoutes = require("./routes/auth"); 
const clubsRoute = require("./routes/clubs");
const recommendRoute = require("./routes/recommend");
const chatbotRoute = require("./routes/chatbot");

app.use(cors());
app.use(express.json()); 

/**
 * SERVE STATIC FRONTEND FILES
 * This line is crucial for your logo to appear. 
 * If app.js is in a 'backend' folder, path.join(__dirname, '../frontend') is correct.
 */
app.use(express.static(path.join(__dirname, '../frontend')));

// --- DATABASE DEBUGGING ---
const tablesToDebug = ['clubs', 'club_interests', 'club_achievements', 'users'];
tablesToDebug.forEach(table => {
    db.query(`DESCRIBE ${table}`, (err, results) => {
        if (!err) {
            console.log(`✅ ${table} table structure:`);
            console.table(results);
        }
    });
});

// 2. Mount API Routes
app.use("/api/auth", authRoutes); 
app.use("/api/clubs", clubsRoute); 
app.use("/api/recommend", recommendRoute);
app.use("/api/chatbot", chatbotRoute);

// Root Route - Serves the index.html from your frontend folder
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Catch-all for API 404s
app.use("/api/:any", (req, res) => {
    res.status(404).json({ error: "API endpoint not found" });
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
    console.log(`📂 Serving frontend from: ${path.join(__dirname, '../frontend')}`);
});