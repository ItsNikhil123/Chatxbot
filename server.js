const PORT = process.env.PORT || 8000;
const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// API Routes
app.post('/gemini', async (req, res) => {
    try {
        const { history, message } = req.body;
        console.log('Chat History:', history);
        console.log('New Message:', message);

        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const chat = model.startChat({
            history: history
        });

        const result = await chat.sendMessage(message);
        const response = await result.response;
        const text = response.text()
        res.json(text);
    } catch (error) {
        console.error('Gemini API Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Serve static files from the public directory
if (process.env.NODE_ENV === 'production') {
    // Serve static files
    app.use(express.static(path.join(__dirname, 'public')));

    // Handle any requests that don't match the above
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, 'public', 'index.html'));
    });
} else {
    // For development, you might want to handle CORS differently
    app.use(cors({
        origin: 'http://chatxbot.netlify.app', // Assuming your React app runs on port 3000
        credentials: true
    }));
}

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
