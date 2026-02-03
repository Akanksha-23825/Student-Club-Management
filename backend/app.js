const express = require("express");
const cors = require("cors");
const path = require("path");
const db = require("./db"); 

const app = express();

// 1. Import API Routes
const authRoutes = require("./routes/auth"); 
const clubsRoute = require("./routes/clubs");
const recommendRoute = require("./routes/recommend");
const chatbotRoute = require("./routes/chatbot");
// NEW: Added routes to match your ER Diagram entities
const membershipRoutes = require("./routes/memberships"); 

// 2. Middleware Configuration
app.use(cors());
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, '../frontend')));

// --- DATABASE DEBUGGING (Feb 18th DBMS Exam Prep) ---
// UPDATED: Added 'memberships' and 'events' to the debug list
const tablesToDebug = [
    'clubs', 
    'club_interests', 
    'club_achievements', 
    'club_contacts', 
    'users', 
    'memberships', 
    'events'
];

tablesToDebug.forEach(table => {
    db.query(`DESCRIBE ${table}`, (err, results) => {
        if (!err) {
            console.log(`✅ ${table} table structure:`);
            console.table(results);
        } else {
            console.error(`❌ Error describing ${table}: Table might not exist yet.`);
        }
    });
});

// 3. Mount API Routes
app.use("/api/auth", authRoutes); 
app.use("/api/clubs", clubsRoute); 
app.use("/api/recommend", recommendRoute);
app.use("/api/chatbot", chatbotRoute);
// NEW: Mount the Membership routes
app.use("/api/memberships", membershipRoutes);

// Root Route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error("🔥 Server Error:", err.stack);
    res.status(500).json({ error: "Something went wrong on the server!" });
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
    console.log(`🚀 Ready for your DBMS Practice!`); 
});