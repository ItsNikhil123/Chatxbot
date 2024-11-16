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

// Security headers middleware
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
});

// Serve static files from the public directory
if (process.env.NODE_ENV === 'production') {
    // Serve static files
    app.use(express.static(path.join(__dirname, 'public')));

    // CORS configuration for production
    app.use(cors({
        origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : 'https://chatxbot.netlify.app',
        methods: ['GET', 'POST'],
        credentials: true,
        maxAge: 86400 // CORS preflight cache for 24 hours
    }));

    // Handle any requests that don't match the above
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, 'public', 'index.html'));
    });
} else {
    // Development CORS settings
    app.use(cors({
        origin: 'http://localhost:3000',
        credentials: true
    }));
}

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something broke!' });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));