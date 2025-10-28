const express = require('express');
const fetch = require('node-fetch');
require('dotenv').config();
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

const OPENAI_KEY = process.env.OPENAI_API_KEY;

app.post('/chat', async (req, res) => {
    const userMessage = req.body.message;
    if (!userMessage) return res.json({ reply: "I got nothing..." });

    try {
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${OPENAI_KEY}`
            },
            body: JSON.stringify({
                model: "gpt-4",
                messages: [{ role: "user", content: userMessage }],
                temperature: 0.7
            })
        });
        const data = await response.json();
        const reply = data.choices?.[0]?.message?.content || "I couldn't think of a response.";
        res.json({ reply });
    } catch (err) {
        console.error(err);
        res.json({ reply: "I’m broken right now..." });
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));