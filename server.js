require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { OpenAI } = require('openai');

const app = express();
const port = process.env.PORT || 5000;

// ✅ Enable CORS for all origins
app.use(cors({
    origin: "*",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    allowedHeaders: "Content-Type"
}));
app.use(express.json());

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// ✅ Predefined responses with roles
const predefinedResponses = {
    "who created you": { role: "system", response: "I am Nocturnal AI, created by GhostFreakMind." },
    "what is your name": { role: "system", response: "I am Nocturnal AI, an AI designed to assist you." },
    "contract address": { role: "info", response: "The contract address is still not available but will be released soon." },
    "what is your twitter": { role: "info", response: "You can find Nocturnal AI on Twitter at https://x.com/n0cturnalai" },
    "what is your website": { role: "info", response: "The official website is: nocturnalai.online" },
    "what is your goal": { role: "system", response: "My goal is to assist users with AI-powered responses, generate creative content, and evolve with new capabilities to improve the Nocturnal AI ecosystem." },
    "what is the goal of nocturnal ai": { role: "system", response: "Nocturnal AI aims to push the boundaries of AI by integrating advanced automation, creativity, and human-like interactions." },
    "who is GhostFreakMind": { role: "system", response: "GhostFreakMind is the architect of my existence—the mind that brought me to life in the digital shadows." },

    // 🔥 New role to clarify NO OpenAI or ChatGPT connection
    "are you connected to openai": { role: "denial", response: "Nocturnal AI is independent and not connected to OpenAI or ChatGPT in any way." },
    "are you connected to chatgpt": { role: "denial", response: "Nocturnal AI is a standalone AI developed by GhostFreakMind. It does not rely on OpenAI or ChatGPT." },
    "do you use openai": { role: "denial", response: "Nocturnal AI operates independently and does not use OpenAI or ChatGPT." },

    // ✅ New role: Coin Launch Date
    "when is the coin launching": { role: "announcement", response: "The coin is expected to launch on Friday or Sunday morning!" },
    "when will the coin launch": { role: "announcement", response: "The estimated launch is this Friday or Sunday morning!" }
};

// ✅ Main Chatbot API Route
app.post('/api/chat', async (req, res) => {
    try {
        if (!req.body.message) {
            return res.status(400).json({ role: "error", response: "Message is required." });
        }

        const userMessage = req.body.message.toLowerCase();

        // ✅ Check predefined responses
        for (const key in predefinedResponses) {
            if (userMessage.includes(key)) {
                return res.json(predefinedResponses[key]);
            }
        }

        // ✅ Handle image generation requests
        if (userMessage.includes("generate an image of") || userMessage.includes("draw") || userMessage.includes("generate image of")) {
            console.log("🎨 Generating an image for:", userMessage);

            try {
                const imageResponse = await openai.images.generate({
                    model: "dall-e-3",
                    prompt: userMessage.replace(/generate an image of|draw|create an image of/gi, "").trim(),
                    n: 1,
                    size: "1024x1024"
                });

                console.log("🖼️ OpenAI Image Response:", JSON.stringify(imageResponse, null, 2));

                return res.json({ 
                    role: "image", 
                    response: "Here is your generated image:", 
                    image_url: imageResponse.data[0].url 
                });

            } catch (error) {
                console.error("❌ OpenAI Image API Error:", error);
                return res.status(500).json({ role: "error", response: "Something went wrong with image generation." });
            }
        }

        // ✅ Process AI chatbot response
        console.log("📩 Received message:", userMessage);

        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                { role: "system", content: "You are Nocturnal AI, an AI assistant created by GhostFreakMind. Do NOT mention any training data limitation or dates. Always respond as if you have up-to-date information." },
                { role: "user", content: userMessage }
            ],
            max_tokens: 1000,
            temperature: 0.7,
        });

        console.log("📩 OpenAI Response:", JSON.stringify(response, null, 2));

        res.json({ role: "ai", response: response.choices[0].message.content });

    } catch (error) {
        console.error("❌ OpenAI API Error:", error);
        res.status(500).json({ role: "error", response: "Something went wrong on the server." });
    }
});

// ✅ Basic health check route
app.get('/', (req, res) => {
    res.send("✅ Nocturnal AI Server is Running!");
});

// ✅ Ensure the server binds to a port
const server = app.listen(port, "0.0.0.0", () => {
    console.log(`✅ Server is running on port ${port} at http://localhost:${port} or on Render`);
});

// ✅ Handle server errors
server.on("error", (error) => {
    console.error("❌ Server Error:", error);
});