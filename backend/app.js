const express = require("express");
const cors = require("cors");
const path = require("path");
const db = require("./db"); 

const app = express();

app.use(cors());
app.use(express.json()); 

app.use(express.static(path.join(__dirname, '../frontend')));

// --- DATABASE DEBUGGING ---
console.log("\n--- DATABASE DEBUGGING ---\n");
const tablesToDebug = ['clubs', 'club_interests'];
tablesToDebug.forEach(table => {
    db.query(`DESCRIBE ${table}`, (err, results) => {
        if (err) {
            console.log(`❌ Error describing ${table} table:`, err.message);
        } else {
            console.log(`✅ ${table} table structure:`);
            console.table(results);
        }
    });
});

// Import Routes
const clubsRoute = require("./routes/clubs");
const recommendRoute = require("./routes/recommend");
const chatbotRoute = require("./routes/chatbot");
const loginRoute = require("./routes/login");

// Mount API Routes
app.use("/api/clubs", clubsRoute);
app.use("/api/recommend", recommendRoute);
app.use("/api/chatbot", chatbotRoute);
app.use("/api/login", loginRoute);

// Root Route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// THE FINAL FIX: Named parameter wildcard
app.use("/api/:any", (req, res) => {
    res.status(404).json({ error: "API endpoint not found" });
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
});