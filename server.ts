import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "25mb" }));

// Lazy Gemini client
let aiClient: GoogleGenAI | null = null;
function getAIClient() {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return aiClient;
}

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    app: "FieldSnap Advisor",
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
    timestamp: new Date().toISOString()
  });
});

// Weather proxy or simulated hyper-local forecast
app.get("/api/weather", async (req, res) => {
  const lat = req.query.lat ? String(req.query.lat) : "28.6139";
  const lon = req.query.lon ? String(req.query.lon) : "77.2090";
  
  try {
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=precipitation_sum,precipitation_probability_max,temperature_2m_max,temperature_2m_min&current=temperature_2m,relative_humidity_2m,weather_code&timezone=auto&forecast_days=3`;
    const response = await fetch(weatherUrl);
    if (response.ok) {
      const data = await response.json();
      return res.json({ success: true, source: "live", data });
    }
  } catch {
    // Fallback if network blocked or offline
  }

  // Graceful local forecast
  res.json({
    success: true,
    source: "fallback",
    data: {
      current: { temperature_2m: 31, relative_humidity_2m: 68 },
      daily: {
        time: [
          new Date().toISOString().split("T")[0],
          new Date(Date.now() + 86400000).toISOString().split("T")[0],
          new Date(Date.now() + 172800000).toISOString().split("T")[0]
        ],
        precipitation_probability_max: [15, 75, 40],
        precipitation_sum: [0.2, 18.5, 4.0]
      }
    }
  });
});

// Server-side Gemini AI Agronomist Audit (optional cloud sync booster)
app.post("/api/diagnose-ai", async (req, res) => {
  const { cropType, answers, heuristics, language = "en" } = req.body;
  const ai = getAIClient();

  if (!ai) {
    return res.json({
      success: false,
      message: "Server Gemini API key not configured. Using offline heuristics model.",
      isOfflineRule: true
    });
  }

  try {
    const prompt = `You are FieldSnap Advisor's expert smallholder agronomist. 
Crop: ${cropType || "Maize"}
Field signals:
- Soil brightness/moisture estimate: ${heuristics?.soilMoisture || "dry"}
- Crop greenness index: ${heuristics?.greennessIndex || "medium"}
- Canopy coverage: ${heuristics?.canopyCoverage || "60%"}
- Recent rain in 3 days: ${answers?.recentRain ? "Yes" : "No"}
- Recent fertilizer applied: ${answers?.recentFertilizer ? "Yes" : "No"}
- Visible leaf yellowing/stunted plants: ${answers?.visibleStress ? "Yes" : "No"}

Provide a crisp smallholder farmer advisory formatted as JSON:
{
  "fertilizerStatus": "red" | "yellow" | "green",
  "fertilizerAction": "short actionable instruction for smallholder farmer in 1 sentence",
  "waterStatus": "red" | "yellow" | "green",
  "waterAction": "short actionable watering instruction in 1 sentence",
  "costHint": "e.g. Save 1 bag of Urea (~₹300) or avoid 15% yield loss",
  "yieldHint": "e.g. Protecting 10-15% crop yield",
  "voiceScript": "friendly spoken audio script for the farmer in ${language} language, reassuring and direct in 2 sentences."
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const text = response.text || "{}";
    const parsed = JSON.parse(text);
    return res.json({ success: true, analysis: parsed });
  } catch (error: any) {
    console.error("Gemini diagnosis error:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Mock sync endpoint for offline queued checks
app.post("/api/sync", (req, res) => {
  const { diagnoses = [], plots = [] } = req.body;
  console.log(`Synced ${plots.length} plots and ${diagnoses.length} diagnoses`);
  res.json({
    success: true,
    syncedAt: new Date().toISOString(),
    count: diagnoses.length
  });
});

// Vite dev or prod server
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`FieldSnap Advisor server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
