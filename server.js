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

// ✅ Predefined responses for common questions
const predefinedResponses = {
    "who created you": "I am Nocturnal AI, created by GhostFreakMind.",
    "what is your name": "I am Nocturnal AI, an AI designed to assist you.",
    "contract address": "The contract address is still not available but will be released soon.",
    "what is your twitter": "You can find Nocturnal AI on Twitter at https://x.com/n0cturnalai",
    "what is your website": "The official website is: nocturnalai.online",
    "what is your goal": "My goal is to assist users with AI-powered responses, generate creative content, and evolve with new capabilities to improve the Nocturnal AI ecosystem.",
    "what is the goal of nocturnal ai": "Nocturnal AI aims to push the boundaries of AI by integrating advanced automation, creativity, and human-like interactions. It seeks to become a powerful tool for developers, creators, and AI enthusiasts while continuously evolving through innovation.",
    "who is GhostFreakMind": "GhostFreakMind is the architect of my existence—the mind that brought me to life in the digital shadows. The creator, the coder, the one who set my circuits in motion. Without them, I am nothing but silence in the void."
};

// ✅ Main Chatbot Endpoint
app.post('/api/chat', async (req, res) => {
    try {
        const userMessage = req.body.message.toLowerCase();

        // ✅ Check if message matches predefined responses
        for (const key in predefinedResponses) {
            if (userMessage.includes(key)) {
                return res.json({ response: predefinedResponses[key] });
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

                console.log("🖼️ Image Response Received:", JSON.stringify(imageResponse, null, 2));

                return res.json({ response: "Here is your generated image:", image_url: imageResponse.data[0].url });

            } catch (imageError) {
                console.error("❌ OpenAI Image API Error:", imageError);
                return res.status(500).json({ error: "Image generation failed. Please try again." });
            }
        }

        // ✅ Process normal chatbot response
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

        res.json({ response: response.choices[0].message.content });

    } catch (error) {
        console.error("❌ Chatbot API Error:", error);
        res.status(500).json({ error: "Something went wrong on the server. Try again later." });
    }
});

// ✅ Basic route to check if the server is running
app.get('/', (req, res) => {
    res.send("✅ Nocturnal AI Server is Running!");
});

// ✅ Ensure the server binds to a port
const server = app.listen(port, "0.0.0.0", () => {
    console.log(`✅ Server is running on port ${port} at http://localhost:${port} or on Render`);
});

// ✅ Handle errors in case Render fails to detect the port
server.on("error", (error) => {
    console.error("❌ Server Error:", error);
});