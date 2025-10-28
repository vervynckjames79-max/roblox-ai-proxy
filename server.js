import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import OpenAI from "openai";

const app = express();
app.use(cors());
app.use(bodyParser.json());

// 🧩 Replace with your real OpenAI API key in Render’s environment settings
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.post("/chat", async (req, res) => {
  try {
    const body = req.body;
    const userMessage = body.message;
    const character =
      body.character ||
      "a neutral but friendly NPC who answers briefly and clearly.";

    if (!userMessage) {
      return res.status(400).json({ reply: "No message provided." });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are ${character}. Respond in short, natural, conversational lines like in a game chat.`,
        },
        { role: "user", content: userMessage },
      ],
    });

    const reply = completion.choices[0].message.content || "I couldn’t think of a response.";
    res.json({ reply });
  } catch (err) {
    console.error(err);
    res.status(500).json({ reply: "Error processing request." });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
