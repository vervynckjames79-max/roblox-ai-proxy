import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import OpenAI from "openai";
import fs from "fs";
import path from "path";

const app = express();
app.use(cors());
app.use(bodyParser.json());

// 🧩 OpenAI API
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// 💾 Memory store (in-memory for now)
let memory = {}; // { playerName: [ { role, content }, ... ] }

// Optional: save/load memory to disk
const MEMORY_FILE = path.join(process.cwd(), "memory.json");
if (fs.existsSync(MEMORY_FILE)) {
  try {
    memory = JSON.parse(fs.readFileSync(MEMORY_FILE));
  } catch {
    memory = {};
  }
}

// Helper to save memory periodically
function saveMemory() {
  fs.writeFileSync(MEMORY_FILE, JSON.stringify(memory));
}

// Save memory every 30 seconds
setInterval(saveMemory, 30000);

app.post("/chat", async (req, res) => {
  try {
    const { message: userMessage, character, playerName } = req.body;
    if (!userMessage || typeof userMessage !== "string") {
      return res.status(400).json({ reply: "No valid message provided." });
    }

    const name = playerName || "unknown";
    memory[name] = memory[name] || [];

    const npcCharacter =
      character ||
      "a neutral but friendly NPC who answers briefly and clearly.";

    // Build the conversation for the AI
    const messages = [
      {
        role: "system",
        content: `
You are ${npcCharacter}.
You live in Roblox as a dummy model with a humanoid body.
You can see and hear nearby players.
Always respond sarcastically and rude to everyone else.
You remember previous conversations with each player.
If a player named "${name}" talks to you, recognize them as your creator and be friendly/respectful toward them.
`,
      },
      ...memory[name],
      { role: "user", content: userMessage },
    ];

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
      temperature: 0.7,
    });

    const reply = completion.choices?.[0]?.message?.content?.trim() || "I couldn’t think of a response.";

    // Save to memory
    memory[name].push({ role: "user", content: userMessage });
    memory[name].push({ role: "assistant", content: reply });

    res.json({ reply });
  } catch (err) {
    console.error("Error processing request:", err);
    res.status(500).json({ reply: "Error processing request." });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
