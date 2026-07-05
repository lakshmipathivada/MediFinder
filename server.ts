import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Gemini API Client
const geminiApiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({
  apiKey: geminiApiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // 1. AI Spell Correction API Endpoint
  app.post('/api/ai/correct-spelling', async (req, res) => {
    try {
      const { query } = req.body;
      if (!query || typeof query !== 'string') {
        return res.json({ corrected: query, hasCorrection: false });
      }

      const prompt = `Correct the spelling of this medicine name, brand name, or generic drug. Only correct it if there is a likely spelling mistake. Return a JSON object with:
      - corrected: string (the corrected version or the original if it is correct or unrecognized)
      - hasCorrection: boolean (true if a typo was corrected, false otherwise)
      - confidence: number (0.0 to 1.0)
      - genericCategory: string (e.g. pain reliever, antibiotic, etc.)
      
      Query: "${query}"`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              corrected: { type: Type.STRING },
              hasCorrection: { type: Type.BOOLEAN },
              confidence: { type: Type.NUMBER },
              genericCategory: { type: Type.STRING }
            },
            required: ['corrected', 'hasCorrection', 'confidence']
          }
        }
      });

      const parsed = JSON.parse(response.text || '{}');
      res.json(parsed);
    } catch (error: any) {
      console.error('Spelling correction error:', error);
      res.status(500).json({ error: 'AI Spell Correction failed', details: error.message });
    }
  });

  // 2. AI Chatbot API Endpoint
  app.post('/api/ai/chat', async (req, res) => {
    try {
      const { messages, selectedMedicine } = req.body;
      if (!Array.isArray(messages)) {
        return res.status(400).json({ error: 'messages must be an array' });
      }

      const systemInstruction = `You are "MediFinder AI", a helpful and professional health assistant. 
Your purpose is to answer user queries about medicine availability, correct usages, dosage categories, drug side-effects, and standard precautions.
Always include a clear medical disclaimer: "I am an AI assistant, not a doctor. Consult a healthcare professional before taking any medicines."
If a user is asking about a specific medicine context (${selectedMedicine || 'none'}), tailor your advice to it.
Be precise, warm, and highly informative. Keep answers concise.`;

      // Translate messages collection into content format if needed
      // Gemini chats can be run or we can use general generateContent with content history
      const formattedContents = messages.map((m: any) => ({
        role: m.sender === 'user' ? 'user' : 'model',
        parts: [{ text: m.text }]
      }));

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: formattedContents,
        config: {
          systemInstruction,
          temperature: 0.7,
        }
      });

      res.json({ reply: response.text });
    } catch (error: any) {
      console.error('AI Chat error:', error);
      res.status(500).json({ error: 'AI Chat failed', details: error.message });
    }
  });

  // 3. AI Alternative Suggestions API Endpoint
  app.post('/api/ai/suggest-alternatives', async (req, res) => {
    try {
      const { medicineName, genericName } = req.body;
      if (!medicineName) {
        return res.status(400).json({ error: 'medicineName is required' });
      }

      const prompt = `Provide 3-4 suitable generic or brand alternatives for the medicine "${medicineName}" (Generic: "${genericName || 'Unspecified'}"). For each alternative:
      - name: string (generic or brand name)
      - type: string (e.g. "Direct Alternative", "Same Generic Group", etc.)
      - suitabilityReason: string (why it is a good replacement)
      - averageDosage: string (common dosage)
      
      Return a JSON array of these objects under the key "alternatives". Include a helpful medical advisory string under "advisory".`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              alternatives: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    type: { type: Type.STRING },
                    suitabilityReason: { type: Type.STRING },
                    averageDosage: { type: Type.STRING }
                  },
                  required: ['name', 'type', 'suitabilityReason']
                }
              },
              advisory: { type: Type.STRING }
            },
            required: ['alternatives', 'advisory']
          }
        }
      });

      res.json(JSON.parse(response.text || '{}'));
    } catch (error: any) {
      console.error('Alternative suggestions error:', error);
      res.status(500).json({ error: 'AI suggestions failed', details: error.message });
    }
  });

  // 4. AI Demand Trends API Endpoint
  app.post('/api/ai/predict-demand', async (req, res) => {
    try {
      const { searchRecords } = req.body;
      // searchRecords contains dummy list or actual aggregated record objects
      const recordsText = JSON.stringify(searchRecords || []);
      
      const prompt = `Based on the following query logs, search histories, and reservation patterns:
      ${recordsText}
      
      Predict the demand trends for the next 30 days. Specifically, output:
      1. Top 3 high-demand medicines/classes.
      2. Estimated percentage growth.
      3. Supply advisory instructions (e.g., stock up on analgesics due to allergies, increase cough syrup supply).
      4. A mock forecast dataset containing 5 points representing weekly demand index for Recharts plotting.
      
      Return a exact JSON matching this schema:
      {
        "topDemands": [
          { "name": "string", "predictedGrowth": 12, "reason": "string" }
        ],
        "supplyAdvisory": "string",
        "chartData": [
          { "week": "Wk 1", "index": 45 },
          { "week": "Wk 2", "index": 60 },
          { "week": "Wk 3", "index": 85 },
          { "week": "Wk 4", "index": 70 },
          { "week": "Wk 5", "index": 92 }
        ]
      }`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              topDemands: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    predictedGrowth: { type: Type.NUMBER },
                    reason: { type: Type.STRING }
                  },
                  required: ['name', 'predictedGrowth', 'reason']
                }
              },
              supplyAdvisory: { type: Type.STRING },
              chartData: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    week: { type: Type.STRING },
                    index: { type: Type.NUMBER }
                  },
                  required: ['week', 'index']
                }
              }
            },
            required: ['topDemands', 'supplyAdvisory', 'chartData']
          }
        }
      });

      res.json(JSON.parse(response.text || '{}'));
    } catch (error: any) {
      console.error('Demand trends prediction error:', error);
      res.status(500).json({ error: 'AI demand prediction failed', details: error.message });
    }
  });

  // Client Assets and SPA Serving via Vite
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: express.Request, res: express.Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`MediFinder Server listening on port ${PORT}`);
  });
}

startServer();
