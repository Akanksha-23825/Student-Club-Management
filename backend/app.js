const express = require('express');
const cors = require('cors');

const clubRoutes = require('./routes/clubs');
const recommendRoutes = require('./routes/recommend');
const chatbotRoutes = require('./routes/chatbot');

const app = express();   // ✅ app is defined HERE

app.use(cors());
app.use(express.json());

app.use('/clubs', clubRoutes);
app.use('/recommend', recommendRoutes);
app.use('/chatbot', chatbotRoutes);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
